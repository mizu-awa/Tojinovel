package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"tojinovel/services"
)

// App struct - Wailsアプリケーションのライフサイクル管理
type App struct {
	ctx            context.Context
	fileService    *services.FileService
	projectManager *services.ProjectManager
}

// NewApp - App構造体を作成
func NewApp(fileService *services.FileService, projectManager *services.ProjectManager) *App {
	return &App{
		fileService:    fileService,
		projectManager: projectManager,
	}
}

// startup - Wails起動時に呼ばれるコールバック
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.projectManager.SetContext(ctx)

	// プロジェクトパスが未設定の場合、開発用デフォルトを設定
	if a.fileService.GetProjectPath() == "" {
		a.setDevDefaultProjectPath()
	}
}

// domReady - DOM構築完了時に呼ばれるコールバック
// index.htmlが直接エディタSPAなのでリダイレクト不要
func (a *App) domReady(ctx context.Context) {
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
		a.projectManager.OpenProject(defaultPath)
		fmt.Println("開発用プロジェクトパス:", defaultPath)
	}
}
