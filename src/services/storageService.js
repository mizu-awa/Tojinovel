// Storage Adapter 管理
// Adapter Pattern により、HTTP / Wails / Browser(将来) を切り替え可能にする

let adapter = null;

export function setAdapter(a) {
  adapter = a;
}

export function getAdapter() {
  return adapter;
}

// 各hookから呼び出す便利オブジェクト
export const storage = {
  loadGameData: (...args) => adapter.loadGameData(...args),
  saveGameData: (...args) => adapter.saveGameData(...args),
  loadEventFile: (...args) => adapter.loadEventFile(...args),
  saveEventFile: (...args) => adapter.saveEventFile(...args),
  resolveAssetUrl: (...args) => adapter.resolveAssetUrl(...args),

  // プロジェクト管理
  listProjects: (...args) => adapter.listProjects?.(...args) ?? Promise.resolve(null),
  openProject: (...args) => adapter.openProject?.(...args) ?? Promise.resolve(null),
  createProject: (...args) => adapter.createProject?.(...args) ?? Promise.resolve(null),
  selectProjectDialog: (...args) => adapter.selectProjectDialog?.(...args) ?? Promise.resolve(null),
  selectNewProjectParentDialog: (...args) => adapter.selectNewProjectParentDialog?.(...args) ?? Promise.resolve(null),
  getCurrentProjectName: (...args) => adapter.getCurrentProjectName?.(...args) ?? Promise.resolve(""),

  // ファイルツリー
  readDir: (...args) => adapter.readDir?.(...args) ?? Promise.resolve(null),
  deleteFile: (...args) => adapter.deleteFile?.(...args) ?? Promise.resolve(null),
  renameFile: (...args) => adapter.renameFile?.(...args) ?? Promise.resolve(null),
  createFile: (...args) => adapter.createFile?.(...args) ?? Promise.resolve(null),
};
