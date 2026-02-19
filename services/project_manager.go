package services

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// ProjectManager - プロジェクト管理サービス
type ProjectManager struct {
	ctx         context.Context
	fileService *FileService
	configPath  string
	embedFS     embed.FS
}

// RecentProject - 最近開いたプロジェクト情報
type RecentProject struct {
	Name         string `json:"name"`
	Path         string `json:"path"`
	LastModified string `json:"lastModified"`
}

// appConfig - アプリ設定ファイルの構造
type appConfig struct {
	RecentProjects []RecentProject `json:"recentProjects"`
}

// NewProjectManager - ProjectManager構造体を作成
func NewProjectManager(fileService *FileService, embedFS embed.FS) *ProjectManager {
	configDir, err := os.UserConfigDir()
	if err != nil {
		configDir = "."
	}
	configPath := filepath.Join(configDir, "Tojinovel", "config.json")

	return &ProjectManager{
		fileService: fileService,
		configPath:  configPath,
		embedFS:     embedFS,
	}
}

// SetContext - Wailsのcontextを設定（startup時に呼ぶ）
func (p *ProjectManager) SetContext(ctx context.Context) {
	p.ctx = ctx
}

// ListRecentProjects - 最近のプロジェクト一覧を取得
func (p *ProjectManager) ListRecentProjects() ([]RecentProject, error) {
	config, err := p.loadConfig()
	if err != nil {
		return []RecentProject{}, nil
	}
	return config.RecentProjects, nil
}

// OpenProject - プロジェクトを開く
func (p *ProjectManager) OpenProject(path string) error {
	// パスの存在確認
	dataPath := filepath.Join(path, "data")
	if _, err := os.Stat(dataPath); os.IsNotExist(err) {
		return fmt.Errorf("有効なプロジェクトフォルダではありません: data/ が見つかりません")
	}

	p.fileService.SetProjectPath(path)

	// 最近のプロジェクトに追加
	p.addToRecent(path)

	return nil
}

// CreateProject - 新規プロジェクトを作成
func (p *ProjectManager) CreateProject(name string, parentDir string) (string, error) {
	projectPath := filepath.Join(parentDir, name)

	// フォルダが既に存在する場合はエラー
	if _, err := os.Stat(projectPath); !os.IsNotExist(err) {
		return "", fmt.Errorf("フォルダが既に存在します: %s", projectPath)
	}

	// プロジェクト構造を作成（system/はトップレベル）
	dirs := []string{
		filepath.Join(projectPath, "data"),
		filepath.Join(projectPath, "data", "events"),
		filepath.Join(projectPath, "data", "images"),
		filepath.Join(projectPath, "data", "sounds"),
	}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return "", fmt.Errorf("ディレクトリ作成に失敗: %w", err)
		}
	}

	// system/ フォルダをトップレベルに作成（埋め込みdist/system/からコピー）
	systemDest := filepath.Join(projectPath, "system")
	if err := p.copyEmbedDir("dist/system", systemDest); err != nil {
		// dist/system/がない場合（開発中など）は空フォルダだけ作成
		_ = os.MkdirAll(systemDest, 0755)
	}

	// デフォルトのgamedata.jsonを配置
	defaultGameData := p.getDefaultGameData()
	gamedataPath := filepath.Join(projectPath, "data", "gamedata.json")
	pretty, err := json.MarshalIndent(defaultGameData, "", "  ")
	if err != nil {
		return "", fmt.Errorf("JSON生成に失敗: %w", err)
	}
	if err := os.WriteFile(gamedataPath, pretty, 0644); err != nil {
		return "", fmt.Errorf("gamedata.json の書き込みに失敗: %w", err)
	}

	// プロジェクトを開く
	if err := p.OpenProject(projectPath); err != nil {
		return "", err
	}

	return projectPath, nil
}

// ExportPlayer - プレイヤーファイルをプロジェクトフォルダに書き出す
// 埋め込みdist/から player.html（→index.html）と assets/ をコピーする
func (p *ProjectManager) ExportPlayer() error {
	projectPath := p.fileService.GetProjectPath()
	if projectPath == "" {
		return fmt.Errorf("プロジェクトが選択されていません")
	}

	// player.html → index.html としてコピー
	playerHTML, err := p.embedFS.ReadFile("dist/player.html")
	if err != nil {
		return fmt.Errorf("player.htmlの読み込みに失敗: %w", err)
	}
	if err := os.WriteFile(filepath.Join(projectPath, "index.html"), playerHTML, 0644); err != nil {
		return fmt.Errorf("index.htmlの書き込みに失敗: %w", err)
	}

	// assets/ フォルダをコピー（Viteビルド済みJS/CSS）
	if err := p.copyEmbedDir("dist/assets", filepath.Join(projectPath, "assets")); err != nil {
		return fmt.Errorf("assetsのコピーに失敗: %w", err)
	}

	// system/ フォルダが存在しない場合はコピー（プロジェクト作成後に手動削除された場合など）
	systemDest := filepath.Join(projectPath, "system")
	if _, err := os.Stat(systemDest); os.IsNotExist(err) {
		_ = p.copyEmbedDir("dist/system", systemDest)
	}

	return nil
}

// SelectProjectDialog - OSフォルダ選択ダイアログを表示
func (p *ProjectManager) SelectProjectDialog() (string, error) {
	if p.ctx == nil {
		return "", fmt.Errorf("コンテキストが未設定です")
	}

	dir, err := wailsRuntime.OpenDirectoryDialog(p.ctx, wailsRuntime.OpenDialogOptions{
		Title: "プロジェクトフォルダを選択",
	})
	if err != nil {
		return "", fmt.Errorf("ダイアログエラー: %w", err)
	}

	// キャンセルされた場合
	if dir == "" {
		return "", nil
	}

	return dir, nil
}

// SelectNewProjectParentDialog - 新規プロジェクトの親フォルダ選択ダイアログ
func (p *ProjectManager) SelectNewProjectParentDialog() (string, error) {
	if p.ctx == nil {
		return "", fmt.Errorf("コンテキストが未設定です")
	}

	dir, err := wailsRuntime.OpenDirectoryDialog(p.ctx, wailsRuntime.OpenDialogOptions{
		Title: "新規プロジェクトの作成場所を選択",
	})
	if err != nil {
		return "", fmt.Errorf("ダイアログエラー: %w", err)
	}

	return dir, nil
}

// GetCurrentProjectName - 現在のプロジェクト名を取得
func (p *ProjectManager) GetCurrentProjectName() string {
	path := p.fileService.GetProjectPath()
	if path == "" {
		return ""
	}
	return filepath.Base(path)
}

// --- 内部メソッド ---

// copyEmbedDir - 埋め込みFSからディスクにディレクトリを再帰コピー
func (p *ProjectManager) copyEmbedDir(srcDir string, destDir string) error {
	entries, err := p.embedFS.ReadDir(srcDir)
	if err != nil {
		return fmt.Errorf("埋め込みディレクトリの読み込みに失敗 (%s): %w", srcDir, err)
	}

	if err := os.MkdirAll(destDir, 0755); err != nil {
		return fmt.Errorf("ディレクトリ作成に失敗 (%s): %w", destDir, err)
	}

	for _, entry := range entries {
		srcPath := srcDir + "/" + entry.Name()
		destPath := filepath.Join(destDir, entry.Name())

		if entry.IsDir() {
			if err := p.copyEmbedDir(srcPath, destPath); err != nil {
				return err
			}
		} else {
			data, err := fs.ReadFile(p.embedFS, srcPath)
			if err != nil {
				return fmt.Errorf("ファイル読み込みに失敗 (%s): %w", srcPath, err)
			}
			if err := os.WriteFile(destPath, data, 0644); err != nil {
				return fmt.Errorf("ファイル書き込みに失敗 (%s): %w", destPath, err)
			}
		}
	}
	return nil
}

// loadConfig - 設定ファイルを読み込む
func (p *ProjectManager) loadConfig() (*appConfig, error) {
	data, err := os.ReadFile(p.configPath)
	if err != nil {
		return &appConfig{}, err
	}

	var config appConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return &appConfig{}, err
	}
	return &config, nil
}

// saveConfig - 設定ファイルを保存
func (p *ProjectManager) saveConfig(config *appConfig) error {
	dir := filepath.Dir(p.configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p.configPath, data, 0644)
}

// addToRecent - 最近のプロジェクトに追加
func (p *ProjectManager) addToRecent(path string) {
	config, _ := p.loadConfig()

	absPath, err := filepath.Abs(path)
	if err != nil {
		absPath = path
	}

	// 既存エントリを除去
	filtered := make([]RecentProject, 0, len(config.RecentProjects))
	for _, rp := range config.RecentProjects {
		rpAbs, _ := filepath.Abs(rp.Path)
		if rpAbs != absPath {
			filtered = append(filtered, rp)
		}
	}

	// 先頭に追加
	entry := RecentProject{
		Name:         filepath.Base(absPath),
		Path:         absPath,
		LastModified: time.Now().Format(time.RFC3339),
	}
	config.RecentProjects = append([]RecentProject{entry}, filtered...)

	// 最大20件
	if len(config.RecentProjects) > 20 {
		config.RecentProjects = config.RecentProjects[:20]
	}

	// 最終更新日でソート（新しい順）
	sort.Slice(config.RecentProjects, func(i, j int) bool {
		return config.RecentProjects[i].LastModified > config.RecentProjects[j].LastModified
	})

	p.saveConfig(config)
}

// getDefaultGameData - 新規プロジェクト用のデフォルトゲームデータ
func (p *ProjectManager) getDefaultGameData() map[string]any {
	return map[string]any{
		"game": map[string]any{
			"title":           "新しいゲーム",
			"screenSize":      []int{800, 480},
			"startScene":      "シーン1",
			"commonSceneName": "",
			"backStyle": map[string]any{
				"backgroundColor": "rgba(255, 255, 255, 1)",
				"backgroundImage": "",
			},
			"gameStyle": map[string]any{
				"backgroundColor": "rgba(0,0,0,1)",
				"fontFamily":      "system-ui",
				"shadowColor":     "rgba(0, 0, 0, 0.5)",
			},
			"sound": map[string]any{
				"bgm":   0.8,
				"se":    1,
				"voice": 1,
			},
			"textBox": map[string]any{
				"speed": 30,
			},
			"itemBox": map[string]any{
				"position": "right",
				"size":     100,
				"foldable": false,
			},
			"character": map[string]any{
				"slots": 3,
			},
		},
		"variables":  []any{},
		"characters": []any{},
		"scenes": []any{
			map[string]any{
				"name":       "シーン1",
				"background": "",
				"hotspots":   []any{},
				"directions": map[string]any{},
				"visitEvent": "",
			},
		},
		"items": []any{},
	}
}
