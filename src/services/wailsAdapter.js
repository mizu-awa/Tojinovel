// Wails Adapter - Wails v2 の Go バインディング経由でファイル操作を行う
// window.go.{package}.StructName.MethodName() 形式で Go の関数を呼び出す
// FileService は package services にあるため window.go.services.FileService

export const wailsAdapter = {
  // ゲームデータ
  loadGameData: async () => {
    const json = await window.go.services.FileService.LoadGameData();
    return JSON.parse(json);
  },

  saveGameData: async (data) => {
    await window.go.services.FileService.SaveGameData(JSON.stringify(data));
  },

  // イベントファイル
  loadEventFile: async (path) => {
    try {
      // Go側でファイル不在の場合はエラーを返す → catch で null を返す
      const content = await window.go.services.FileService.LoadEventFile(path);
      return content;  // "" (空ファイル) も有効なコンテンツとして返す
    } catch {
      return null;
    }
  },

  saveEventFile: async (path, content) => {
    await window.go.services.FileService.SaveEventFile(path, content);
  },

  // アセットURL解決（AssetHandlerが処理するため、相対パスそのまま）
  resolveAssetUrl: (path) => path,

  // プロジェクト管理
  listProjects: () => window.go.services.ProjectManager.ListRecentProjects(),
  openProject: (path) => window.go.services.ProjectManager.OpenProject(path),
  createProject: (name, parentDir) => window.go.services.ProjectManager.CreateProject(name, parentDir),
  selectProjectDialog: () => window.go.services.ProjectManager.SelectProjectDialog(),
  selectNewProjectParentDialog: () => window.go.services.ProjectManager.SelectNewProjectParentDialog(),
  getCurrentProjectName: () => window.go.services.ProjectManager.GetCurrentProjectName(),

  // ファイルツリー（仮想エクスプローラー用）
  readDir: (path) => window.go.services.FileService.ReadDir(path),
  readDirRecursive: () => window.go.services.FileService.ReadDirRecursive(),
  deleteFile: (path) => window.go.services.FileService.DeleteFile(path),
  renameFile: (oldPath, newPath) => window.go.services.FileService.RenameFile(oldPath, newPath),
  createFile: (path) => window.go.services.FileService.CreateFile(path),

  // プレイヤー書き出し
  exportPlayer: () => window.go.services.ProjectManager.ExportPlayer(),

  // ファイルインポート（ダイアログ経由、コピー先フォルダを指定）
  importFile: (destDir) => window.go.services.ProjectManager.ImportFile(destDir),

  // ファイルD&Dインポート（BlobをBase64エンコードしてGo経由で書き込む）
  writeFileBlob: async (destPath, blob) => {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    await window.go.services.FileService.WriteFileBase64(destPath, base64);
    return destPath;
  },
};
