package main

import (
	"context"
)

// App struct - Wailsアプリケーションのライフサイクル管理
type App struct {
	ctx context.Context
}

// NewApp - App構造体を作成
func NewApp() *App {
	return &App{}
}

// startup - Wails起動時に呼ばれるコールバック
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}
