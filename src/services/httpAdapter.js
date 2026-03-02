// HTTP Adapter - 既存のfetchベースのAPI（Go HTTPサーバー）経由でファイル操作を行う
// Wailsなし（ブラウザ + Go HTTPサーバー）環境で使用

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export const httpAdapter = {
  // ゲームデータ
  loadGameData: async () => {
    const res = await fetch("data/gamedata.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  },

  saveGameData: async (data) => {
    const res = await fetch(`${API_BASE}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
  },

  // イベントファイル
  loadEventFile: async (path) => {
    const res = await fetch(path);
    if (!res.ok) return null;
    const ct = res.headers.get("Content-Type");
    if (!ct || !ct.startsWith("text/")) return null;
    return res.text();
  },

  saveEventFile: async (path, content) => {
    const serverPath = path.replace(/^\.\//, "");
    const res = await fetch(`${API_BASE}/save-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: serverPath, content }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
  },

  // アセットURL解決（相対パスそのまま）
  resolveAssetUrl: (path) => path,

  // プロジェクト管理・ファイルツリー（HTTP環境では非対応）
  // storageService.js の optional chaining により自動的に null/[] を返す
};
