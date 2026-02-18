// Wails Adapter - Wails v2 の Go バインディング経由でファイル操作を行う
// window.go.main.StructName.MethodName() 形式で Go の関数を呼び出す

export const wailsAdapter = {
  // ゲームデータ
  loadGameData: async () => {
    const json = await window.go.main.FileService.LoadGameData();
    return JSON.parse(json);
  },

  saveGameData: async (data) => {
    await window.go.main.FileService.SaveGameData(JSON.stringify(data, null, 2));
  },

  // イベントファイル
  loadEventFile: async (path) => {
    const content = await window.go.main.FileService.LoadEventFile(path);
    // Go側で存在しないファイルは空文字を返す
    return content || null;
  },

  saveEventFile: async (path, content) => {
    await window.go.main.FileService.SaveEventFile(path, content);
  },

  // アセットURL解決（AssetHandlerが処理するため、相対パスそのまま）
  resolveAssetUrl: (path) => path,

  // ファイルツリー（仮想エクスプローラー用）
  readDir: (path) => window.go.main.FileService.ReadDir(path),
  deleteFile: (path) => window.go.main.FileService.DeleteFile(path),
  renameFile: (oldPath, newPath) => window.go.main.FileService.RenameFile(oldPath, newPath),
};
