package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"tojinovel/services"
)

//go:embed all:dist
var assets embed.FS

func main() {
	fileService := services.NewFileService()
	projectManager := services.NewProjectManager(fileService)
	app := NewApp(fileService, projectManager)
	assetHandler := services.NewAssetHandler(fileService)

	err := wails.Run(&options.App{
		Title:      "Tojinovel",
		Width:      1280,
		Height:     800,
		AssetServer: &assetserver.Options{
			Assets:  assets,
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
