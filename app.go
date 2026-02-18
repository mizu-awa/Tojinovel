package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"tojinovel/services"
)

// App struct - Wailsアプリケーションのライフサイクル管理
type App struct {
	ctx         context.Context
	fileService *services.FileService
}

// NewApp - App構造体を作成
func NewApp(fileService *services.FileService) *App {
	return &App{
		fileService: fileService,
	}
}

// startup - Wails起動時に呼ばれるコールバック
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// プロジェクトパスが未設定の場合、開発用デフォルトを設定
	if a.fileService.GetProjectPath() == "" {
		a.setDevDefaultProjectPath()
	}
}

// domReady - DOM構築完了時に呼ばれるコールバック
func (a *App) domReady(ctx context.Context) {
	// Wailsアプリではエディタを表示（index.htmlからリダイレクト）
	wailsRuntime.WindowExecJS(ctx, `
		if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
			window.location.replace('/editor.html');
		}
	`)
}

// setDevDefaultProjectPath - 開発時のデフォルトプロジェクトパスを設定
// public/ ディレクトリにdata/があればそこをプロジェクトパスとする
func (a *App) setDevDefaultProjectPath() {
	cwd, err := os.Getwd()
	if err != nil {
		fmt.Println("作業ディレクトリ取得に失敗:", err)
		return
	}

	// public/ ディレクトリを開発用デフォルトとして使用
	defaultPath := filepath.Join(cwd, "public")
	dataPath := filepath.Join(defaultPath, "data")
	if info, err := os.Stat(dataPath); err == nil && info.IsDir() {
		a.fileService.SetProjectPath(defaultPath)
		fmt.Println("開発用プロジェクトパス:", defaultPath)
	}
}
