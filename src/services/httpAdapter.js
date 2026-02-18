// HTTP Adapter - 既存のGoサーバー + fetch ベースの動作をAdapter化
// Wails化前でもAdapter経由で動作する状態を維持する

const API_BASE = import.meta.env.VITE_API_BASE;

export const httpAdapter = {
  loadGameData: async () => {
    const res = await fetch("./data/gamedata.json");
    if (!res.ok) throw new Error("HTTPエラー: " + res.status);
    return res.json();
  },

  saveGameData: async (data) => {
    const res = await fetch(`${API_BASE}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("HTTPエラー: " + res.status);
  },

  loadEventFile: async (path) => {
    const res = await fetch(path);
    if (!res.ok) return null;
    const ct = res.headers.get("Content-Type");
    // text/htmlが返ってきた場合はファイルが存在しない（サーバーがHTMLを返している）
    if (ct && ct.startsWith("text/html")) return null;
    if (!ct || !ct.startsWith("text/")) return null;
    return res.text();
  },

  saveEventFile: async (path, content) => {
    // サーバーに送るパスは ./ を除去
    const serverPath = path.replace(/^\.\//, "");
    const res = await fetch(`${API_BASE}/save-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: serverPath, content }),
    });
    if (!res.ok) throw new Error("HTTPエラー: " + res.status);
  },

  // 現状通り相対パスそのまま
  resolveAssetUrl: (path) => path,
};
