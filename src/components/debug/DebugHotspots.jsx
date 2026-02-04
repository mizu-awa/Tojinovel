import { memo } from "react";

function DebugHotspots({ hotspots, currentSceneName, items, viewItemName, updateGameData, theme }) {
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

  // 現在開いているアイテムのホットスポットのみ表示
  let viewItem = null;
  let viewItemIndex = -1;
  if (viewItemName && items) {
    viewItemIndex = items.findIndex((item) => item.name === viewItemName);
    if (viewItemIndex !== -1) {
      viewItem = items[viewItemIndex];
    }
  }
  const itemHotspots = viewItem?.hotspots || [];

  // スタイル
  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    alignItems: "center",
    padding: "4px 0",
    borderBottom: `1px solid ${theme.border}`,
  };

  const nameStyle = {
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: theme.text,
  };

  const selectStyle = {
    backgroundColor: theme.paper,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 4,
    color: theme.text,
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
    backgroundColor: visible ? theme.primary : theme.muted,
    marginRight: 6,
    flexShrink: 0,
  });

  return (
    <div>
      {/* シーンホットスポット */}
      <div style={{ fontSize: "11px", color: theme.textSecondary, marginBottom: 8 }}>
        シーン: <span style={{ color: theme.primary }}>{currentSceneName}</span>
      </div>

      {/* ヘッダー */}
      <div style={{ ...rowStyle, fontWeight: 700, fontSize: "11px", color: theme.textMuted }}>
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

      <div style={{ marginTop: 4, fontSize: "11px", color: theme.textMuted, marginBottom: 24 }}>
        {hotspots.length} ホットスポット
      </div>
      

      {/* アイテムホットスポット */}
      {viewItem ? (
        <div>
          <div style={{ fontSize: "11px", color: theme.textSecondary, marginBottom: 8 }}>
            アイテム: <span style={{ color: theme.primary }}>{viewItem.name}</span>
          </div>

          {/* ヘッダー */}
          <div style={{ ...rowStyle, fontWeight: 700, fontSize: "11px", color: theme.textMuted }}>
            <span>ホットスポット</span>
            <span>ステート</span>
          </div>

          {itemHotspots.length > 0 ? (
            itemHotspots.map((hs, hsIndex) => (
              <div key={hs.name} style={rowStyle}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={visibilityDotStyle(getVisibility(hs))} title={getVisibility(hs) ? "表示中" : "非表示"} />
                  <span style={nameStyle} title={hs.name}>{hs.name}</span>
                </div>
                <select
                  style={selectStyle}
                  value={hs.state}
                  onChange={(e) => handleItemStateChange(viewItemIndex, hsIndex, e.target.value)}
                >
                  {hs.states.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            ))
          ) : (
            <div style={{ fontSize: "12px", color: theme.textMuted, padding: "4px 0" }}>
              ホットスポットなし
            </div>
          )}

          <div style={{ marginTop: 4, fontSize: "11px", color: theme.textMuted }}>
            {itemHotspots.length} ホットスポット
          </div>
        </div>
      ) : (
        <div style={{ fontSize: "12px", color: theme.textMuted, padding: "4px 0" }}>
          {viewItemName
            ? `アイテム「${viewItemName}」が見つかりません`
            : "アイテムホットスポットは、アイテムウィンドウを開くと表示されます"}
        </div>
      )}
    </div>
  );
}

export default memo(DebugHotspots);
