import { memo, useEffect, useRef } from "react";

// デバッグコンソール：#コンソール: コマンドの出力を表示
function DebugConsole({ consoleLogs, clearConsoleLogs, theme }) {
  // refs-------------------------------------------------------------------------------------------
  const bottomRef = useRef(null);

  // effects-----------------------------------------------------------------------------------------
  // ログ追加時に自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  // styles------------------------------------------------------------------------------------------
  const buttonStyle = {
    padding: "2px 8px",
    backgroundColor: theme.paper,
    color: theme.text,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "inherit",
  };

  const logStyle = {
    padding: "3px 0",
    borderBottom: `1px solid ${theme.border}`,
    fontSize: "12px",
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
  };

  const timestampStyle = {
    color: theme.textMuted,
    fontSize: "10px",
    flexShrink: 0,
    fontFamily: "monospace",
  };

  // render------------------------------------------------------------------------------------------
  return (
    <div>
      {/* ヘッダー */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
      }}>
        <span style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 700 }}>
          コンソール
        </span>
        <button style={buttonStyle} onClick={clearConsoleLogs}>
          クリア
        </button>
      </div>

      {/* ログ一覧 */}
      {consoleLogs.length === 0 ? (
        <div style={{ fontSize: "12px", color: theme.textMuted, padding: "4px 0" }}>
          ログはありません
        </div>
      ) : (
        consoleLogs.map((log, i) => (
          <div key={i} style={logStyle}>
            <span style={timestampStyle}>
              {log.timestamp.toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span style={{ color: theme.text, wordBreak: "break-all" }}>
              {log.message}
            </span>
          </div>
        ))
      )}

      {/* 自動スクロール用アンカー */}
      <div ref={bottomRef} />
    </div>
  );
}

export default memo(DebugConsole);
