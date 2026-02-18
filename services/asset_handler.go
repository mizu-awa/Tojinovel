package services

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// AssetHandler - プロジェクト内の相対パスアセットを配信するHTTPハンドラ
// Wails v2 の AssetServer.Handler として使用。
// フロントエンドの埋め込みアセットで解決できなかったリクエスト（例: ./data/images/bg.png）を
// プロジェクトフォルダ内の実ファイルにマッピングして返す。
type AssetHandler struct {
	fileService *FileService
}

// NewAssetHandler - AssetHandler を作成
func NewAssetHandler(fileService *FileService) *AssetHandler {
	return &AssetHandler{
		fileService: fileService,
	}
}

// ServeHTTP - http.Handler インターフェースの実装
func (h *AssetHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// プロジェクトが選択されていない場合は404
	projectPath := h.fileService.GetProjectPath()
	if projectPath == "" {
		http.NotFound(w, r)
		return
	}

	// リクエストパスからプロジェクト内ファイルを解決
	requestPath := strings.TrimPrefix(r.URL.Path, "/")
	if requestPath == "" {
		http.NotFound(w, r)
		return
	}

	// セキュリティチェック: ディレクトリトラバーサル防止
	clean := filepath.Clean(requestPath)
	if strings.Contains(clean, "..") {
		http.Error(w, "不正なパス", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join(projectPath, clean)

	// プロジェクトフォルダ外へのアクセスを防止
	absProject, err := filepath.Abs(projectPath)
	if err != nil {
		http.Error(w, "内部エラー", http.StatusInternalServerError)
		return
	}
	absFull, err := filepath.Abs(fullPath)
	if err != nil {
		http.Error(w, "内部エラー", http.StatusInternalServerError)
		return
	}
	if !strings.HasPrefix(absFull, absProject+string(filepath.Separator)) && absFull != absProject {
		http.Error(w, "アクセス拒否", http.StatusForbidden)
		return
	}

	// ファイルの存在確認
	info, err := os.Stat(fullPath)
	if err != nil || info.IsDir() {
		http.NotFound(w, r)
		return
	}

	// Content-Type自動判定してファイル配信
	// キャッシュ無効化（開発時にアセットが即座に反映されるように）
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")

	// Content-Type を拡張子から判定
	ext := strings.ToLower(filepath.Ext(fullPath))
	contentType := getContentType(ext)
	if contentType != "" {
		w.Header().Set("Content-Type", contentType)
	}

	http.ServeFile(w, r, fullPath)
}

// getContentType - 拡張子からContent-Typeを判定
func getContentType(ext string) string {
	types := map[string]string{
		// 画像
		".png":  "image/png",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".gif":  "image/gif",
		".webp": "image/webp",
		".svg":  "image/svg+xml",
		".ico":  "image/x-icon",
		// 音声
		".mp3":  "audio/mpeg",
		".wav":  "audio/wav",
		".ogg":  "audio/ogg",
		".m4a":  "audio/mp4",
		".flac": "audio/flac",
		// 動画
		".mp4":  "video/mp4",
		".webm": "video/webm",
		// テキスト
		".json": "application/json",
		".txt":  "text/plain; charset=utf-8",
		".html": "text/html; charset=utf-8",
		".css":  "text/css; charset=utf-8",
		".js":   "application/javascript",
	}

	if ct, ok := types[ext]; ok {
		return ct
	}
	return "" // http.ServeFileに任せる
}

// LogInfo - デバッグ用のリクエストログ出力
func (h *AssetHandler) LogInfo() string {
	return fmt.Sprintf("AssetHandler: projectPath=%s", h.fileService.GetProjectPath())
}
