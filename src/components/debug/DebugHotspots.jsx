import { memo } from "react";

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  alignItems: "center",
  padding: "4px 0",
  borderBottom: "1px solid #e0e0e0",
};

const nameStyle = {
  fontSize: "12px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "#333",
};

const selectStyle = {
  backgroundColor: "#fff",
  border: "1px solid #c4c4c4",
  borderRadius: 4,
  color: "#333",
  padding: "3px 4px",
  fontSize: "12px",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const visibilityDotStyle = (visible) => ({
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: visible ? "#4bbeeb" : "#c4c4c4",
  marginRight: 6,
  flexShrink: 0,
});

const sectionHeaderStyle = {
  fontSize: "11px",
  color: "#999",
  fontWeight: 700,
  marginBottom: 6,
  marginTop: 12,
};

function DebugHotspots({ hotspots, currentSceneName, items, updateGameData }) {
  // シーンホットスポットのステートを変更
  const handleStateChange = (hotspotIndex, newStateName) => {
    updateGameData((prev) => {
      const next = { ...prev };
      const sceneIndex = next.scenes.findIndex((s) => s.name === currentSceneName);
      if (sceneIndex === -1) return prev;

      next.scenes = [...next.scenes];
      next.scenes[sceneIndex] = { ...next.scenes[sceneIndex] };
      next.scenes[sceneIndex].hotspots = [...next.scenes[sceneIndex].hotspots];
      next.scenes[sceneIndex].hotspots[hotspotIndex] = {
        ...next.scenes[sceneIndex].hotspots[hotspotIndex],
        state: newStateName,
      };
      return next;
    });
  };

  // アイテムホットスポットのステートを変更
  const handleItemStateChange = (itemIndex, hotspotIndex, newStateName) => {
    updateGameData((prev) => {
      const next = { ...prev };
      next.items = [...next.items];
      next.items[itemIndex] = { ...next.items[itemIndex] };
      next.items[itemIndex].hotspots = [...next.items[itemIndex].hotspots];
      next.items[itemIndex].hotspots[hotspotIndex] = {
        ...next.items[itemIndex].hotspots[hotspotIndex],
        state: newStateName,
      };
      return next;
    });
  };

  // 現在のステートの可視性を取得
  const getVisibility = (hotspot) => {
    const currentState = hotspot.states.find((s) => s.name === hotspot.state);
    return currentState ? currentState.visibility : false;
  };

  // ホットスポットを持つアイテムのみフィルタ
  const itemsWithHotspots = items
    ? items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.hotspots && item.hotspots.length > 0)
    : [];

  return (
    <div>
      {/* シーンホットスポット */}
      <div style={{ fontSize: "11px", color: "#666", marginBottom: 8 }}>
        シーン: <span style={{ color: "#4bbeeb" }}>{currentSceneName}</span>
      </div>

      {/* ヘッダー */}
      <div style={{ ...rowStyle, fontWeight: 700, fontSize: "11px", color: "#999" }}>
        <span>ホットスポット</span>
        <span>ステート</span>
      </div>

      {hotspots.map((hs, i) => (
        <div key={hs.name} style={rowStyle}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={visibilityDotStyle(getVisibility(hs))} title={getVisibility(hs) ? "表示中" : "非表示"} />
            <span style={nameStyle} title={hs.name}>{hs.name}</span>
          </div>
          <select
            style={selectStyle}
            value={hs.state}
            onChange={(e) => handleStateChange(i, e.target.value)}
          >
            {hs.states.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div style={{ marginTop: 4, fontSize: "11px", color: "#999" }}>
        {hotspots.length} ホットスポット
      </div>

      {/* アイテムホットスポット */}
      {itemsWithHotspots.length > 0 && (
        <>
          <div style={sectionHeaderStyle}>アイテムホットスポット</div>

          {itemsWithHotspots.map(({ item, index: itemIndex }) => (
            <div key={item.name}>
              <div style={{ fontSize: "12px", color: "#4bbeeb", fontWeight: 700, padding: "4px 0" }}>
                {item.name}
              </div>

              {item.hotspots.map((hs, hsIndex) => (
                <div key={hs.name} style={rowStyle}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={visibilityDotStyle(getVisibility(hs))} title={getVisibility(hs) ? "表示中" : "非表示"} />
                    <span style={nameStyle} title={hs.name}>{hs.name}</span>
                  </div>
                  <select
                    style={selectStyle}
                    value={hs.state}
                    onChange={(e) => handleItemStateChange(itemIndex, hsIndex, e.target.value)}
                  >
                    {hs.states.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default memo(DebugHotspots);
