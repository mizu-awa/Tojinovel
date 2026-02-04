import { memo, useState, useEffect } from "react";

function DebugTimers({ timers, stopTimer, restartTimer, theme }) {
  // timersはrefなので定期的に再描画する
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const timerList = timers.current || [];

  // スタイル
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

  const statusDotStyle = (active) => ({
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: active ? theme.primary : theme.muted,
    marginRight: 6,
  });

  return (
    <div>
      <div style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 700, marginBottom: 6 }}>
        タイマー
      </div>

      {timerList.length === 0 ? (
        <div style={{ fontSize: "12px", color: theme.textMuted, padding: "4px 0" }}>
          アクティブなタイマーはありません
        </div>
      ) : (
        timerList.map((timer, i) => (
          <div key={i} style={{ padding: "4px 0", borderBottom: `1px solid ${theme.border}`, fontSize: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: theme.text }}>
                <span style={statusDotStyle(!timer.paused && !timer.finished)} />
                {timer.varName}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {!timer.finished && (
                  timer.paused ? (
                    <button style={buttonStyle} onClick={() => restartTimer(timer.varName)}>
                      再開
                    </button>
                  ) : (
                    <button style={buttonStyle} onClick={() => stopTimer(timer.varName)}>
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
  );
}

export default memo(DebugTimers);
