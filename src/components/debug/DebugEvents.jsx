import { memo, useState, useEffect, useRef } from "react";
import { loadEventLines } from "../../hooks/useEventLines.js";

function DebugEvents({
  lines, setLines, backLines, index, executeEvent, characters,
  timers, stopTimer, restartTimer,
  bgm, audioManager,
  consoleLogs, clearConsoleLogs,
  theme,
}) {
  const [file, setFile] = useState("");
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState(null);

  // タイマー・オーディオはrefなので定期的に再描画する
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // コンソールログ追加時に自動スクロール
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  const timerList = timers.current || [];
  const currentBgm = bgm.current;

  // functions-------------------------------------------------------------------------------------------
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

  // BGM停止
  const handleStopBGM = () => {
    if (audioManager) {
      audioManager.stopBGM();
      bgm.current = null;
    }
  };

  // styles-------------------------------------------------------------------------------------------
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

  const smallButtonStyle = {
    padding: "2px 8px",
    backgroundColor: theme.paper,
    color: theme.text,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "inherit",
  };

  const dotStyle = (active) => ({
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: active ? theme.primary : theme.muted,
    flexShrink: 0,
  });

  const sectionStyle = {
    borderTop: `1px solid ${theme.border}`,
    paddingTop: 8,
    marginTop: 8,
  };

  const sectionHeaderStyle = {
    fontSize: "11px",
    color: theme.textMuted,
    fontWeight: 700,
    marginBottom: 6,
  };

  const logStyle = {
    padding: "3px 0",
    borderBottom: `1px solid ${theme.border}`,
    fontSize: "12px",
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
  };

  // render-------------------------------------------------------------------------------------------
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
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>実行状態</div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: "12px" }}>
          <span style={dotStyle(!!lines)} />
          <span>フロントイベント: {lines ? `実行中（行 ${index}）` : "なし"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: "12px" }}>
          <span style={dotStyle(!!backLines)} />
          <span>バックグラウンドイベント: {backLines ? "実行中" : "なし"}</span>
        </div>
      </div>

      {/* タイマー */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>タイマー</div>

        {timerList.length === 0 ? (
          <div style={{ fontSize: "12px", color: theme.textMuted, padding: "4px 0" }}>
            アクティブなタイマーはありません
          </div>
        ) : (
          timerList.map((timer, i) => (
            <div key={i} style={{ padding: "4px 0", borderBottom: `1px solid ${theme.border}`, fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: theme.text }}>
                  <span style={{ ...dotStyle(!timer.paused && !timer.finished), marginRight: 6 }} />
                  {timer.varName}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  {!timer.finished && (
                    timer.paused ? (
                      <button style={smallButtonStyle} onClick={() => restartTimer(timer.varName)}>
                        再開
                      </button>
                    ) : (
                      <button style={smallButtonStyle} onClick={() => stopTimer(timer.varName)}>
                        一時停止
                      </button>
                    )
                  )}
                </div>
              </div>
              <div style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginTop: 2,
                color: theme.textSecondary,
                fontSize: "11px",
              }}>
                <span>カウント: {timer.count}</span>
                <span>終了値: {timer.end}</span>
                <span>ステップ: {timer.step}</span>
                <span>
                  {timer.finished ? "完了" : timer.paused ? "一時停止中" : "実行中"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* オーディオ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>BGM</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
          <span>
            <span style={{ ...dotStyle(!!currentBgm), marginRight: 6 }} />
            {currentBgm || "再生なし"}
          </span>
          {currentBgm && (
            <button style={smallButtonStyle} onClick={handleStopBGM}>
              停止
            </button>
          )}
        </div>
      </div>

      {/* コンソール */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={sectionHeaderStyle}>コンソール</span>
          <button style={smallButtonStyle} onClick={clearConsoleLogs}>
            クリア
          </button>
        </div>

        {consoleLogs.length === 0 ? (
          <div style={{ fontSize: "12px", color: theme.textMuted, padding: "4px 0" }}>
            ログはありません
          </div>
        ) : (
          consoleLogs.map((log, i) => (
            <div key={i} style={logStyle}>
              <span style={{ color: theme.textMuted, fontSize: "10px", flexShrink: 0, fontFamily: "monospace" }}>
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
    </div>
  );
}

export default memo(DebugEvents);
