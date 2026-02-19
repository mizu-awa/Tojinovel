package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"tojinovel/services"
)

//go:embed all:dist
var assets embed.FS

func main() {
	// dist/ サブディレクトリをFSのルートとして扱う（Wails v2の要件）
	distFS, err := fs.Sub(assets, "dist")
	if err != nil {
		log.Fatal("dist/ FS作成に失敗:", err)
	}

	fileService := services.NewFileService()
	projectManager := services.NewProjectManager(fileService, assets)
	app := NewApp(fileService, projectManager)
	assetHandler := services.NewAssetHandler(fileService)

	err = wails.Run(&options.App{
		Title:      "Tojinovel",
		Width:      1280,
		Height:     800,
		AssetServer: &assetserver.Options{
			Assets:  distFS,
			Handler: assetHandler,
		},
		OnStartup:  app.startup,
		OnDomReady: app.domReady,
		Bind: []interface{}{
			app,
			fileService,
			projectManager,
		},
	})
	if err != nil {
		println("エラー:", err.Error())
	}
}
