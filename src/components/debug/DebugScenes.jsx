import { memo } from "react";

const listItemStyle = (active) => ({
  padding: "6px 8px",
  borderRadius: 4,
  cursor: "pointer",
  backgroundColor: active ? "#e3f2fd" : "transparent",
  borderLeft: active ? "3px solid #4bbeeb" : "3px solid transparent",
  marginBottom: 2,
});

const nameStyle = (active) => ({
  fontWeight: active ? 700 : 400,
  color: active ? "#4bbeeb" : "#333",
  fontSize: "13px",
});

const directionStyle = {
  display: "flex",
  gap: 6,
  marginTop: 2,
  flexWrap: "wrap",
};

const dirTagStyle = {
  fontSize: "10px",
  color: "#666",
  backgroundColor: "#e0e0e0",
  padding: "1px 5px",
  borderRadius: 4,
};

const DIRS = [
  { key: "top",    label: "上" },
  { key: "right",  label: "右" },
  { key: "bottom", label: "下" },
  { key: "left",   label: "左" },
];

function DebugScenes({ scenes, currentSceneName, moveScene }) {
  return (
    <div>
      {scenes.map((scene) => {
        const active = scene.name === currentSceneName;
        return (
          <div
            key={scene.name}
            style={listItemStyle(active)}
            onClick={() => moveScene(scene.name)}
          >
            <div style={nameStyle(active)}>
              {scene.name}
              {active && <span style={{ fontSize: "10px", marginLeft: 6, color: "#999" }}>（現在）</span>}
            </div>

            {/* 方向リンク */}
            <div style={directionStyle}>
              {DIRS.map((d) =>
                scene.directions[d.key]?.target ? (
                  <span
                    key={d.key}
                    style={dirTagStyle}
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

      <div style={{ marginTop: 8, fontSize: "11px", color: "#999" }}>
        {scenes.length} シーン
      </div>
    </div>
  );
}

export default memo(DebugScenes);
