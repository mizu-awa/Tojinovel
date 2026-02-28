package services

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// FileService - プロジェクト内ファイルの読み書きサービス
type FileService struct {
	mu          sync.RWMutex
	projectPath string
}

// FileInfo - ファイル情報（ReadDir用）
type FileInfo struct {
	Name  string `json:"name"`
	IsDir bool   `json:"isDir"`
	Size  int64  `json:"size"`
}

// NewFileService - FileService構造体を作成
func NewFileService() *FileService {
	return &FileService{}
}

// SetProjectPath - プロジェクトパスを設定
func (f *FileService) SetProjectPath(path string) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.projectPath = path
}

// GetProjectPath - 現在のプロジェクトパスを取得
func (f *FileService) GetProjectPath() string {
	f.mu.RLock()
	defer f.mu.RUnlock()
	return f.projectPath
}

// validatePath - パスのバリデーション（ディレクトリトラバーサル防止）
func (f *FileService) validatePath(relativePath string) (string, error) {
	f.mu.RLock()
	projectPath := f.projectPath
	f.mu.RUnlock()

	if projectPath == "" {
		return "", fmt.Errorf("プロジェクトが選択されていません")
	}

	clean := filepath.Clean(relativePath)
	// ".."を含むパスは拒否
	if strings.Contains(clean, "..") {
		return "", fmt.Errorf("不正なパス: %s", relativePath)
	}

	full := filepath.Join(projectPath, clean)
	absProject, err := filepath.Abs(projectPath)
	if err != nil {
		return "", fmt.Errorf("プロジェクトパスの解決に失敗: %w", err)
	}
	absFull, err := filepath.Abs(full)
	if err != nil {
		return "", fmt.Errorf("パスの解決に失敗: %w", err)
	}

	// プロジェクトフォルダ外へのアクセスを防止
	// absProject+Separator でプレフィックス境界を確実にチェック（MyProject と MyProjectEvil の誤判定を防ぐ）
	if absFull != absProject && !strings.HasPrefix(absFull, absProject+string(filepath.Separator)) {
		return "", fmt.Errorf("プロジェクト外へのアクセス: %s", relativePath)
	}
	return full, nil
}

// LoadGameData - gamedata.json を読み込んでJSON文字列として返す
func (f *FileService) LoadGameData() (string, error) {
	path, err := f.validatePath(filepath.Join("data", "gamedata.json"))
	if err != nil {
		return "", err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("gamedata.json の読み込みに失敗: %w", err)
	}
	return string(data), nil
}

// SaveGameData - JSON文字列を整形して gamedata.json に保存
func (f *FileService) SaveGameData(jsonStr string) error {
	path, err := f.validatePath(filepath.Join("data", "gamedata.json"))
	if err != nil {
		return err
	}

	// JSON整形
	var tmp any
	if err := json.Unmarshal([]byte(jsonStr), &tmp); err != nil {
		return fmt.Errorf("不正なJSON: %w", err)
	}
	pretty, err := json.MarshalIndent(tmp, "", "  ")
	if err != nil {
		return fmt.Errorf("JSON整形に失敗: %w", err)
	}

	return os.WriteFile(path, pretty, 0644)
}

// LoadEventFile - イベントファイルを相対パスで読み込む
func (f *FileService) LoadEventFile(relativePath string) (string, error) {
	// フロントエンドからのパスは "./" で始まる場合がある
	cleanPath := strings.TrimPrefix(relativePath, "./")
	fullPath, err := f.validatePath(cleanPath)
	if err != nil {
		return "", err
	}

	data, err := os.ReadFile(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			return "", fmt.Errorf("ファイルが存在しません: %s", relativePath)
		}
		return "", fmt.Errorf("ファイル読み込みに失敗: %w", err)
	}
	return string(data), nil
}

// SaveEventFile - イベントファイルを相対パスで保存
func (f *FileService) SaveEventFile(relativePath string, content string) error {
	cleanPath := strings.TrimPrefix(relativePath, "./")
	fullPath, err := f.validatePath(cleanPath)
	if err != nil {
		return err
	}

	// ディレクトリを自動作成
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("ディレクトリ作成に失敗: %w", err)
	}

	return os.WriteFile(fullPath, []byte(content), 0644)
}

// ReadDir - ディレクトリ内のファイル一覧を取得
func (f *FileService) ReadDir(relativePath string) ([]FileInfo, error) {
	cleanPath := strings.TrimPrefix(relativePath, "./")
	fullPath, err := f.validatePath(cleanPath)
	if err != nil {
		return nil, err
	}

	entries, err := os.ReadDir(fullPath)
	if err != nil {
		return nil, fmt.Errorf("ディレクトリ読み込みに失敗: %w", err)
	}

	var result []FileInfo
	for _, entry := range entries {
		// ドットファイル（.gitignore等）は非表示
		if strings.HasPrefix(entry.Name(), ".") {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		result = append(result, FileInfo{
			Name:  entry.Name(),
			IsDir: entry.IsDir(),
			Size:  info.Size(),
		})
	}
	return result, nil
}

// DeleteFile - ファイルを削除
func (f *FileService) DeleteFile(relativePath string) error {
	cleanPath := strings.TrimPrefix(relativePath, "./")
	// 空パス（プロジェクトルート）への削除を防止
	if cleanPath == "" || cleanPath == "." {
		return fmt.Errorf("プロジェクトルートは削除できません")
	}
	fullPath, err := f.validatePath(cleanPath)
	if err != nil {
		return err
	}
	return os.RemoveAll(fullPath)
}

// RenameFile - ファイルをリネーム（移動も兼ねる）
func (f *FileService) RenameFile(oldPath string, newPath string) error {
	cleanOld := strings.TrimPrefix(oldPath, "./")
	cleanNew := strings.TrimPrefix(newPath, "./")

	fullOld, err := f.validatePath(cleanOld)
	if err != nil {
		return err
	}
	fullNew, err := f.validatePath(cleanNew)
	if err != nil {
		return err
	}

	return os.Rename(fullOld, fullNew)
}

// WriteFileBase64 - base64エンコードされたバイナリデータをファイルに書き込む（D&Dインポート用）
func (f *FileService) WriteFileBase64(relativePath string, base64Data string) error {
	cleanPath := strings.TrimPrefix(relativePath, "./")
	fullPath, err := f.validatePath(cleanPath)
	if err != nil {
		return err
	}

	// base64デコード
	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return fmt.Errorf("base64デコードに失敗: %w", err)
	}

	// 親ディレクトリを自動作成
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("ディレクトリ作成に失敗: %w", err)
	}

	return os.WriteFile(fullPath, data, 0644)
}

// ReadDirRecursive - プロジェクト内の全ファイルを再帰的に取得（相対パスのフラット配列）
func (f *FileService) ReadDirRecursive() ([]string, error) {
	f.mu.RLock()
	projectPath := f.projectPath
	f.mu.RUnlock()

	if projectPath == "" {
		return nil, fmt.Errorf("プロジェクトが選択されていません")
	}

	var files []string
	err := filepath.Walk(projectPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // エラーのあるエントリはスキップ
		}
		// ドットファイル・ドットディレクトリはスキップ
		if strings.HasPrefix(info.Name(), ".") {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		// ディレクトリは除外（ファイルのみ）
		if info.IsDir() {
			return nil
		}
		rel, err := filepath.Rel(projectPath, path)
		if err != nil {
			return nil
		}
		// Windowsのバックスラッシュをスラッシュに統一
		files = append(files, filepath.ToSlash(rel))
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("ディレクトリ走査に失敗: %w", err)
	}
	return files, nil
}

// CreateDir - ディレクトリを新規作成（既存の場合はエラー）
func (f *FileService) CreateDir(relativePath string) error {
	cleanPath := strings.TrimPrefix(relativePath, "./")
	fullPath, err := f.validatePath(cleanPath)
	if err != nil {
		return err
	}

	// 既存チェック
	if _, err := os.Stat(fullPath); err == nil {
		return fmt.Errorf("同名のフォルダまたはファイルが既に存在します: %s", relativePath)
	}

	if err := os.MkdirAll(fullPath, 0755); err != nil {
		return fmt.Errorf("フォルダ作成に失敗: %w", err)
	}
	return nil
}

// CreateFile - 空のファイルを新規作成（既存ファイルは上書きしない）
func (f *FileService) CreateFile(relativePath string) error {
	cleanPath := strings.TrimPrefix(relativePath, "./")
	fullPath, err := f.validatePath(cleanPath)
	if err != nil {
		return err
	}

	// 親ディレクトリを自動作成
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("ディレクトリ作成に失敗: %w", err)
	}

	// 既存ファイルがある場合はエラー
	file, err := os.OpenFile(fullPath, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0644)
	if err != nil {
		if os.IsExist(err) {
			return fmt.Errorf("同名のファイルが既に存在します: %s", relativePath)
		}
		return fmt.Errorf("ファイル作成に失敗: %w", err)
	}
	return file.Close()
}
