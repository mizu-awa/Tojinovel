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
};
