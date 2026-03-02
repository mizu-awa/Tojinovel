// Storage Adapter 管理
// Adapter Pattern により、HTTP / Wails / Browser(将来) を切り替え可能にする

let adapter = null;

export function setAdapter(a) {
  adapter = a;
}

export function getAdapter() {
  return adapter;
}

// アダプター未設定時のガード
function ensureAdapter() {
  if (!adapter) throw new Error("ストレージアダプターが未設定です");
  return adapter;
}

// 各hookから呼び出す便利オブジェクト
export const storage = {
  loadGameData: (...args) => ensureAdapter().loadGameData(...args),
  saveGameData: (...args) => ensureAdapter().saveGameData(...args),
  loadEventFile: (...args) => ensureAdapter().loadEventFile(...args),
  saveEventFile: (...args) => ensureAdapter().saveEventFile(...args),
  resolveAssetUrl: (...args) => ensureAdapter().resolveAssetUrl(...args),

  // プロジェクト管理
  listProjects: (...args) => adapter.listProjects?.(...args) ?? Promise.resolve(null),
  openProject: (...args) => adapter.openProject?.(...args) ?? Promise.resolve(null),
  createProject: (...args) => adapter.createProject?.(...args) ?? Promise.resolve(null),
  selectProjectDialog: (...args) => adapter.selectProjectDialog?.(...args) ?? Promise.resolve(null),
  selectNewProjectParentDialog: (...args) => adapter.selectNewProjectParentDialog?.(...args) ?? Promise.resolve(null),
  getCurrentProjectName: (...args) => adapter.getCurrentProjectName?.(...args) ?? Promise.resolve(""),
  getCurrentProjectPath: () => adapter.getCurrentProjectPath?.() ?? "",

  // ファイルツリー
  readDir: (...args) => adapter.readDir?.(...args) ?? Promise.resolve(null),
  readDirRecursive: (...args) => adapter.readDirRecursive?.(...args) ?? Promise.resolve([]),
  deleteFile: (...args) => adapter.deleteFile?.(...args) ?? Promise.resolve(null),
  renameFile: (...args) => adapter.renameFile?.(...args) ?? Promise.resolve(null),
  createFile: (...args) => adapter.createFile?.(...args) ?? Promise.resolve(null),
  createDir: (...args) => adapter.createDir?.(...args) ?? Promise.resolve(null),

  // プレイヤー書き出し
  exportPlayer: (...args) => adapter.exportPlayer?.(...args) ?? Promise.resolve(null),

  // ファイルインポート（ダイアログ経由）
  importFile: (...args) => adapter.importFile?.(...args) ?? Promise.resolve(null),

  // ファイルD&Dインポート（BlobをそのままD&D先フォルダに書き込む）
  writeFileBlob: (...args) => adapter.writeFileBlob?.(...args) ?? Promise.resolve(null),
};
