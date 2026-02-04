import { memo } from "react";

const DIRS = [
  { key: "top",    label: "上" },
  { key: "right",  label: "右" },
  { key: "bottom", label: "下" },
  { key: "left",   label: "左" },
];

function DebugScenes({ scenes, currentSceneName, moveScene, theme }) {
  return (
    <div>
      {scenes.map((scene) => {
        const active = scene.name === currentSceneName;
        return (
          <div
            key={scene.name}
            style={{
              padding: "6px 8px",
              borderRadius: 4,
              cursor: "pointer",
              backgroundColor: active ? theme.activeBg : "transparent",
              borderLeft: active ? `3px solid ${theme.primary}` : "3px solid transparent",
              marginBottom: 2,
            }}
            onClick={() => moveScene(scene.name)}
          >
            <div style={{
              fontWeight: active ? 700 : 400,
              color: active ? theme.primary : theme.text,
              fontSize: "13px",
            }}>
              {scene.name}
              {active && <span style={{ fontSize: "10px", marginLeft: 6, color: theme.textMuted }}>（現在）</span>}
            </div>

            {/* 方向リンク */}
            <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
              {DIRS.map((d) =>
                scene.directions[d.key]?.target ? (
                  <span
                    key={d.key}
                    style={{
                      fontSize: "10px",
                      color: theme.textSecondary,
                      backgroundColor: theme.border,
                      padding: "1px 5px",
                      borderRadius: 4,
                    }}
                    title={`${d.label} → ${scene.directions[d.key].target}`}
                  >
                    {d.label}:{scene.directions[d.key].target}
                  </span>
                ) : null
              )}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 8, fontSize: "11px", color: theme.textMuted }}>
        {scenes.length} シーン
      </div>
    </div>
  );
}

export default memo(DebugScenes);
