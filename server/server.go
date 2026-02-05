package main

import (
	"encoding/json"
	"fmt"
	"hash/fnv"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

// --- 設定用構造体 ---
type Config struct {
	Port     string `json:"port"`
	DistDir  string `json:"distDir"`
	SaveFile string `json:"saveFile"`
}

// デフォルト値
var cfg = Config{
	Port:     "42736",
	DistDir:  "./game",
	SaveFile: "./game/data/gamedata.json",
}

// --- ブラウザ自動起動 ---
func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default: // Linux
		err = exec.Command("xdg-open", url).Start()
	}
	if err != nil {
		log.Println("ブラウザ自動起動に失敗:", err)
	}
}

// --- 保存API ---
func handleSave(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "read error", 500)
		return
	}

	// JSONの形式チェック（兼・構造デコード）
	var tmp any
	if err := json.Unmarshal(body, &tmp); err != nil {
		http.Error(w, "invalid JSON", 400)
		return
	}

	// ★JSONをタブや改行入りで整形する（MarshalIndent）
	pretty, err := json.MarshalIndent(tmp, "", "  ") // ←2スペース
	if err != nil {
		http.Error(w, "format error", 500)
		return
	}

	// 保存
	err = os.WriteFile(cfg.SaveFile, pretty, 0644)
	if err != nil {
		http.Error(w, "save failed", 500)
		return
	}

	w.WriteHeader(200)
	w.Write([]byte("ok"))
}

// --- イベントファイル保存API ---
type SaveEventRequest struct {
	Path    string `json:"path"`
	Content string `json:"content"`
}

func handleSaveEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "read error", 500)
		return
	}

	var req SaveEventRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "invalid JSON", 400)
		return
	}

	if req.Path == "" {
		http.Error(w, "path is required", 400)
		return
	}

	// パスバリデーション: ディレクトリトラバーサル防止
	cleanPath := filepath.Clean(req.Path)
	if strings.Contains(cleanPath, "..") {
		http.Error(w, "invalid path", 400)
		return
	}
	if filepath.IsAbs(cleanPath) {
		http.Error(w, "invalid path", 400)
		return
	}

	// distDir配下のフルパスを構築し、収まるか確認
	fullPath := filepath.Join(cfg.DistDir, cleanPath)
	absDistDir, _ := filepath.Abs(cfg.DistDir)
	absFullPath, _ := filepath.Abs(fullPath)
	if !strings.HasPrefix(absFullPath, absDistDir) {
		http.Error(w, "invalid path", 400)
		return
	}

	// ディレクトリを自動作成
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		http.Error(w, "failed to create directory", 500)
		return
	}

	// ファイル書き込み
	if err := os.WriteFile(fullPath, []byte(req.Content), 0644); err != nil {
		http.Error(w, "save failed", 500)
		return
	}

	w.WriteHeader(200)
	w.Write([]byte("ok"))
}

// --- 設定ファイル読み込み ---
func loadConfig() {
	f, err := os.Open("config.json")
	if err != nil {
		log.Println("config.json が見つかりません。デフォルト値を使用します。")
		setPortFromDistDir()
		return
	}
	defer f.Close()

	if err := json.NewDecoder(f).Decode(&cfg); err != nil {
		log.Println("config.json の読み込みに失敗しました:", err)
	}

	// Portが空文字の場合はDistDirのハッシュから生成
	if cfg.Port == "" {
		setPortFromDistDir()
	}
}

// --- DistDirからポート番号を生成 ---
func setPortFromDistDir() {
	h := fnv.New32a()
	h.Write([]byte(cfg.DistDir))
	// ポート番号は3100～3999に収まるように
	port := 3100 + int(h.Sum32()%(3999-3100))
	cfg.Port = fmt.Sprintf("%d", port)
	log.Println("ポート番号を自動設定:", cfg.Port)
}

// --- CORSを許可するラッパー ---
var isDev = os.Getenv("ENV") == "development"

func withCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// 開発中はViteからのアクセスを許可
		if isDev {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		}

		// プリフライト
		if r.Method == http.MethodOptions {
			w.WriteHeader(200)
			return
		}

		h.ServeHTTP(w, r)
	})
}

// --- メイン ---
func main() {
	loadConfig()
	addr := ":" + cfg.Port

	// dist フォルダを静的配信
	fs := http.FileServer(http.Dir(cfg.DistDir))
	http.Handle("/", fs)

	// 保存API
	http.Handle("/save", withCORS(http.HandlerFunc(handleSave)))

	// イベントファイル保存API
	http.Handle("/save-event", withCORS(http.HandlerFunc(handleSaveEvent)))

	// サーバー起動
	url := "http://localhost:" + cfg.Port
	fmt.Println("Server started:", url)
	openBrowser(url)

	// debug.html が存在する場合のみ開く
	editorPath_debug := filepath.Join(cfg.DistDir, "debug.html")
	if _, err := os.Stat(editorPath_debug); err == nil {
		openBrowser(url + "/debug.html")
	}

	// editor.html が存在する場合のみ開く
	editorPath := filepath.Join(cfg.DistDir, "editor.html")
	if _, err := os.Stat(editorPath); err == nil {
		openBrowser(url + "/editor.html")
	}

	err := http.ListenAndServe(addr, nil)
	if err != nil {
		log.Fatal(err)
	}
}
