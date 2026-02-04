import { memo, useState } from "react";
import { loadEventLines } from "../../hooks/useEventLines.js";

function DebugEvents({ lines, setLines, backLines, index, executeEvent, characters, theme }) {
  const [file, setFile] = useState("");
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState(null);

  // イベントを手動実行
  const handleExecute = async () => {
    if (!file) {
      setStatus("ファイルパスを入力してください");
      return;
    }
    setStatus("読み込み中...");
    const parsedLines = await loadEventLines(file, label || undefined, characters);
    if (parsedLines) {
      executeEvent(parsedLines);
      setStatus("実行開始");
    } else {
      setStatus("読み込み失敗（ファイルまたはラベルが見つかりません）");
    }
  };

  // 実行中のイベントを強制終了
  const handleForceFinish = () => {
    setLines(null);
    setStatus("イベントを強制終了しました");
  };

  // スタイル
  const inputStyle = {
    backgroundColor: theme.paper,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 4,
    color: theme.text,
    padding: "4px 6px",
    fontSize: "12px",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  };

  const buttonStyle = (color) => ({
    padding: "5px 12px",
    backgroundColor: theme.paper,
    color: theme.text,
    border: `1px solid ${color || theme.inputBorder}`,
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
  });

  const dotStyle = (active) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: active ? theme.primary : theme.muted,
    flexShrink: 0,
  });

  return (
    <div>
      {/* イベント実行フォーム */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: "11px", color: theme.textMuted, marginBottom: 2, display: "block" }}>
          イベントファイル
        </label>
        <input
          type="text"
          placeholder="./data/events/event.txt"
          value={file}
          onChange={(e) => setFile(e.target.value)}
          style={{ ...inputStyle, marginBottom: 6 }}
        />

        <label style={{ fontSize: "11px", color: theme.textMuted, marginBottom: 2, display: "block" }}>
          ラベル（省略可）
        </label>
        <input
          type="text"
          placeholder="ラベル名"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ ...inputStyle, marginBottom: 8 }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button style={buttonStyle(theme.primary)} onClick={handleExecute}>
            実行
          </button>
          <button
            style={buttonStyle("#e55")}
            onClick={handleForceFinish}
            disabled={!lines}
          >
            強制終了
          </button>
        </div>

        {status && (
          <div style={{ marginTop: 6, fontSize: "11px", color: theme.textSecondary }}>
            {status}
          </div>
        )}
      </div>

      {/* 実行状態 */}
      <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 8 }}>
        <div style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 700, marginBottom: 6 }}>
          実行状態
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: "12px" }}>
          <span style={dotStyle(!!lines)} />
          <span>フロントイベント: {lines ? `実行中（行 ${index}）` : "なし"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: "12px" }}>
          <span style={dotStyle(!!backLines)} />
          <span>バックグラウンドイベント: {backLines ? "実行中" : "なし"}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(DebugEvents);
