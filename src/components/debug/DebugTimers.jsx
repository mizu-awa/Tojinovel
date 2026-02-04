import { memo, useState, useEffect } from "react";

const rowStyle = {
  padding: "4px 0",
  borderBottom: "1px solid #e0e0e0",
  fontSize: "12px",
};

const timerNameStyle = {
  fontWeight: 700,
  color: "#333",
};

const timerInfoStyle = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  marginTop: 2,
  color: "#666",
  fontSize: "11px",
};

const buttonStyle = {
  padding: "2px 8px",
  backgroundColor: "#fff",
  color: "#333",
  border: "1px solid #c4c4c4",
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
  backgroundColor: active ? "#4bbeeb" : "#c4c4c4",
  marginRight: 6,
});

function DebugTimers({ timers, stopTimer, restartTimer }) {
  // timersはrefなので定期的に再描画する
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const timerList = timers.current || [];

  return (
    <div>
      <div style={{ fontSize: "11px", color: "#999", fontWeight: 700, marginBottom: 6 }}>
        タイマー
      </div>

      {timerList.length === 0 ? (
        <div style={{ fontSize: "12px", color: "#999", padding: "4px 0" }}>
          アクティブなタイマーはありません
        </div>
      ) : (
        timerList.map((timer, i) => (
          <div key={i} style={rowStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={timerNameStyle}>
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
            <div style={timerInfoStyle}>
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
