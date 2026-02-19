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
	"strings"
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

// ImportFile - ファイル選択ダイアログを開き、選択したファイルをプロジェクト内の指定フォルダにコピー
func (p *ProjectManager) ImportFile(destDir string) (string, error) {
	if p.ctx == nil {
		return "", fmt.Errorf("コンテキストが未設定です")
	}

	projectPath := p.fileService.GetProjectPath()
	if projectPath == "" {
		return "", fmt.Errorf("プロジェクトが選択されていません")
	}

	// ファイル選択ダイアログを開く
	filePath, err := wailsRuntime.OpenFileDialog(p.ctx, wailsRuntime.OpenDialogOptions{
		Title: "インポートするファイルを選択",
	})
	if err != nil {
		return "", fmt.Errorf("ダイアログエラー: %w", err)
	}
	// キャンセルされた場合
	if filePath == "" {
		return "", nil
	}

	// コピー先ディレクトリを検証・作成
	destRelClean := strings.TrimPrefix(filepath.ToSlash(destDir), "./")
	destAbsDir := filepath.Join(projectPath, filepath.FromSlash(destRelClean))

	absProject, err := filepath.Abs(projectPath)
	if err != nil {
		return "", fmt.Errorf("プロジェクトパス解決失敗: %w", err)
	}
	absDestDir, err := filepath.Abs(destAbsDir)
	if err != nil {
		return "", fmt.Errorf("コピー先パス解決失敗: %w", err)
	}
	if !strings.HasPrefix(absDestDir, absProject) {
		return "", fmt.Errorf("コピー先がプロジェクト外です")
	}

	if err := os.MkdirAll(destAbsDir, 0755); err != nil {
		return "", fmt.Errorf("フォルダ作成失敗: %w", err)
	}

	// ファイルをコピー
	srcData, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("ファイル読み込み失敗: %w", err)
	}

	fileName := filepath.Base(filePath)
	destFilePath := filepath.Join(destAbsDir, fileName)
	if err := os.WriteFile(destFilePath, srcData, 0644); err != nil {
		return "", fmt.Errorf("ファイル書き込み失敗: %w", err)
	}

	// フロントエンドに返す相対パス（./ + destDir/ファイル名）
	relPath := "./" + filepath.ToSlash(filepath.Join(destRelClean, fileName))
	return relPath, nil
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
// src/datas/defaultGameData.js の defaultGameData と対応
func (p *ProjectManager) getDefaultGameData() map[string]any {
	defaultUsedItem := map[string]any{"item": "", "file": "", "label": ""}
	defaultState := map[string]any{
		"name":       "default",
		"x":          0,
		"y":          0,
		"width":      100,
		"height":     100,
		"background": "",
		"text":       "",
		"zIndex":     10,
		"visibility": true,
		"style": map[string]any{
			"backgroundColor": "rgba(0,0,0,0)",
			"borderStyle":     "none",
			"borderWidth":     "1px",
			"borderColor":     "rgba(0,0,0,0)",
			"shadowColor":     "rgba(0,0,0,0)",
			"fontSize":        "16px",
			"color":           "rgba(0,0,0,1)",
			"textAlign":       "left",
			"fontWeight":      400,
			"borderRadius":    0,
			"textVAlign":      "center",
			"textPadding":     "0px",
			"rotate":          0,
			"fontFamily":      "",
		},
		"hover":         "none",
		"inputMode":     false,
		"inputVariable": "",
		"draggable":     false,
		"onDragEnd":     map[string]any{"file": "", "label": ""},
		"onClick":       map[string]any{"file": "", "label": ""},
		"usedItems":     []any{defaultUsedItem},
	}
	defaultHotspot := map[string]any{
		"name":   "New hotspot",
		"state":  "default",
		"states": []any{defaultState},
	}
	defaultExpression := map[string]any{
		"name":  "通常",
		"image": "./system/character_image.png",
	}
	defaultCharacter := map[string]any{
		"name":              "キャラクター1",
		"defaultExpression": "通常",
		"expressions":       []any{defaultExpression},
	}
	defaultScene := map[string]any{
		"name":       "New Scene",
		"background": "./system/scene_image.png",
		"visitEvent": map[string]any{"file": "", "label": ""},
		"directions": map[string]any{
			"top":    map[string]any{"target": ""},
			"right":  map[string]any{"target": ""},
			"bottom": map[string]any{"target": ""},
			"left":   map[string]any{"target": ""},
		},
		"hotspots": []any{defaultHotspot},
	}
	defaultItem := map[string]any{
		"name":     "New item",
		"image":    "./system/item_image.png",
		"have":     true,
		"hotspots": []any{defaultHotspot},
	}
	defaultVariable := map[string]any{"name": "New data", "value": "0"}

	return map[string]any{
		"game": map[string]any{
			"title":           "Game title",
			"screenSize":      []int{800, 480},
			"startScene":      "New Scene",
			"commonSceneName": "",
			"character":       map[string]any{"slots": 3},
			"save": map[string]any{
				"slots":      3,
				"auto":       false,
				"dataText":   "Save Data",
				"saveText":   "Save",
				"loadText":   "Load",
				"noDataText": "No Data",
				"autoText":   "Auto",
				"hover":      "none",
				"gap":        10,
				"backStyle": map[string]any{
					"backgroundColor": "rgba(222,222,222,1)",
					"backgroundImage": "",
					"padding":         "10px 30px",
				},
				"titleStyle": map[string]any{
					"fontSize":        "24px",
					"color":           "rgba(0,0,0,1)",
					"backgroundColor": "transparent",
					"padding":         "0px",
				},
				"closeBtnStyle": map[string]any{
					"size":  24,
					"color": "rgba(0,0,0,1)",
					"hover": "hoverOp",
				},
				"buttonStyle": map[string]any{
					"padding":         10,
					"color":           "rgba(0,0,0,1)",
					"fontSize":        "16px",
					"backgroundColor": "rgba(255,255,255,1)",
					"backgroundImage": "",
					"borderStyle":     "none",
					"borderWidth":     "1px",
					"borderColor":     "rgba(0, 0, 0, 1)",
					"borderRadius":    "5px",
				},
			},
			"backStyle": map[string]any{
				"backgroundColor": "rgba(255,255,255,1)",
				"backgroundImage": "",
			},
			"gameStyle": map[string]any{
				"borderColor": "rgba(0,0,0,1)",
				"borderWidth": 1,
				"borderStyle": "none",
				"shadowColor": "rgba(0, 0, 0, 0.3)",
				"color":       "rgba(0,0,0,1)",
				"fontFamily":  "system-ui",
			},
			"itemBox": map[string]any{
				"size":           160,
				"position":       "right",
				"space":          10,
				"paginationSize": 16,
				"columnCount":    2,
				"hover":          "none",
				"foldable":       false,
				"boxStyle": map[string]any{
					"backgroundColor": "rgba(240,240,240,1)",
					"backgroundImage": "",
					"color":           "rgba(0,0,0,1)",
				},
				"itemStyle": map[string]any{
					"backgroundColor": "rgba(255,255,255,1)",
					"borderRadius":    "0px",
				},
				"selectedItemBorder": map[string]any{
					"color": "rgba(255,0,0,1)",
					"width": "2px",
					"style": "solid",
				},
			},
			"itemDrawer": map[string]any{
				"size": []int{320, 240},
				"style": map[string]any{
					"backgroundColor": "rgba(255,255,255,1)",
					"borderRadius":    "0px",
				},
				"backStyle": map[string]any{
					"backgroundColor": "rgba(0,0,0,0.5)",
				},
			},
			"textBox": map[string]any{
				"position": []int{20, 320},
				"size":     []int{600, 150},
				"speed":    80,
				"style": map[string]any{
					"backgroundColor":      "rgba(0,0,0,0.6)",
					"backgroundImage":      "",
					"borderTopStyle":       "solid",
					"borderTopWidth":       "0px",
					"borderTopColor":       "rgba(0,0,0,0)",
					"padding":              10,
					"lineHeight":           1.2,
					"textAlign":            "left",
					"borderTopRightRadius": "0px",
					"color":                "rgba(255,255,255,1)",
					"fontSize":             "16px",
				},
				"highlightStyle": map[string]any{
					"color":       "rgba(255,0,0,1)",
					"strokeColor": "rgba(255,255,255,1)",
				},
				"nameStyle": map[string]any{
					"backgroundColor": "rgba(0,0,0,0.6)",
					"backgroundImage": "",
					"color":           "rgba(255,255,255,1)",
					"fontSize":        "16px",
					"padding":         12,
					"minWidth":        120,
					"distance":        0,
					"borderWidth":     "0px",
					"borderStyle":     "solid",
					"borderColor":     "rgba(0,0,0,0)",
					"borderRadius":    "0px",
				},
				"indicator": map[string]any{"text": "▼"},
			},
			"direction": map[string]any{
				"size":            40,
				"useDefaultArrow": true,
				"hover":           "none",
				"style": map[string]any{
					"backgroundColor": "rgba(0,0,0,0)",
					"color":           "rgba(125,125,125,1)",
				},
				"images": map[string]any{
					"top": "", "right": "", "bottom": "", "left": "",
				},
			},
			"option": map[string]any{
				"position": []int{50, 50},
				"size":     180,
				"gap":      20,
				"hover":    "none",
				"style": map[string]any{
					"backgroundColor": "rgba(0,0,0,0.5)",
					"backgroundImage": "",
					"padding":         5,
					"borderStyle":     "none",
					"borderColor":     "rgba(0,0,0,1)",
					"borderWidth":     "0px",
					"borderRadius":    "0px",
					"fontSize":        "16px",
					"color":           "rgba(0,0,0,1)",
					"textAlign":       "left",
				},
			},
			"image": map[string]any{
				"position": []int{180, 50},
				"size":     []int{300, 400},
				"style": map[string]any{
					"borderStyle": "none",
					"borderWidth": "1px",
					"borderColor": "rgba(255,255,255,1)",
				},
			},
			"input": map[string]any{
				"position": []int{180, 80},
				"size":     []int{300, 140},
				"hover":    "none",
				"backStyle": map[string]any{
					"backgroundColor": "rgba(0,0,0,0.2)",
					"backgroundImage": "",
					"borderRadius":    "5px",
					"borderStyle":     "none",
					"borderWidth":     "1px",
					"borderColor":     "rgba(255, 255, 255, 1)",
				},
				"inputStyle": map[string]any{
					"color":           "rgba(0,0,0,1)",
					"fontSize":        "16px",
					"backgroundColor": "rgba(255,255,255,1)",
					"borderStyle":     "solid",
					"borderWidth":     "1",
					"borderColor":     "rgba(0, 0, 0, 1)",
					"borderRadius":    "0px",
				},
				"buttonStyle": map[string]any{
					"color":           "rgba(0,0,0,1)",
					"fontSize":        "16px",
					"backgroundColor": "rgba(255,255,255,1)",
					"borderStyle":     "none",
					"borderWidth":     "1px",
					"borderColor":     "rgba(0, 0, 0, 1)",
					"borderRadius":    "5px",
				},
			},
			"menu": map[string]any{
				"position":      "bottom right",
				"saveText":      "Save",
				"loadText":      "Load",
				"configText":    "config",
				"visibleSave":   true,
				"visibleLoad":   true,
				"visibleConfig": true,
				"hover":         "none",
				"style": map[string]any{
					"fontSize":   "16px",
					"gap":        10,
					"fontWeight": 500,
				},
			},
			"config": map[string]any{
				"bgmText":      "BGM音量",
				"seText":       "SE音量",
				"voiceText":    "ボイス音量",
				"speedText":    "文字送り速度",
				"visibleBGM":   true,
				"visibleSE":    true,
				"visibleVoice": true,
				"visibleSpeed": true,
				"visibleAuto":  true,
				"autoText":     "オート",
				"backStyle": map[string]any{
					"backgroundColor": "rgba(255,255,255,1)",
					"backgroundImage": "",
				},
				"containerStyle": map[string]any{
					"backgroundColor": "rgba(200,200,200,1)",
					"backgroundImage": "",
					"width":           450,
					"gap":             12,
					"color":           "rgba(0,0,0,1)",
					"fontSize":        "16px",
					"borderStyle":     "none",
					"borderWidth":     "1px",
					"borderColor":     "rgba(0, 0, 0, 1)",
					"borderRadius":    "5px",
					"shadowColor":     "rgba(0, 0, 0, 1)",
				},
				"trackStyle": map[string]any{
					"height":          6,
					"borderRadius":    "3px",
					"backgroundColor": "rgba(180, 42, 42, 1)",
				},
				"thumbStyle": map[string]any{
					"size":            20,
					"backgroundColor": "rgba(55, 80, 202, 1)",
					"borderColor":     "rgba(255, 255, 255, 1)",
					"borderStyle":     "solid",
					"borderWidth":     "2px",
				},
			},
			"auto": map[string]any{
				"enabled": false,
				"speed":   2000,
			},
			"sound": map[string]any{
				"bgm":   0.8,
				"se":    1,
				"voice": 1,
			},
		},
		"variables":  []any{defaultVariable},
		"characters": []any{defaultCharacter},
		"scenes":     []any{defaultScene},
		"items":      []any{defaultItem},
	}
}
