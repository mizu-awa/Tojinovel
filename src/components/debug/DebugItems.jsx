import { memo } from "react";

function DebugItems({ items, selectedItem, selectItem, updateGameData, theme }) {
  // アイテムの所持状態を切り替え
  const toggleHave = (index) => {
    updateGameData((prev) => {
      const next = { ...prev };
      next.items = [...next.items];
      next.items[index] = { ...next.items[index], have: !next.items[index].have };
      return next;
    });
  };

  // 選択アイテムを切り替え
  const handleSelect = (itemName) => {
    selectItem(selectedItem === itemName ? null : itemName);
  };

  // スタイル
  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 0",
    borderBottom: `1px solid ${theme.border}`,
  };

  return (
    <div>
      {/* ヘッダー */}
      <div style={{ ...rowStyle, fontSize: "11px", color: theme.textMuted, fontWeight: 700 }}>
        <span style={{ width: 24 }}>所持</span>
        <span style={{ flex: 1 }}>アイテム名</span>
      </div>

      {items.map((item, i) => (
        <div key={item.name} style={rowStyle}>
          <input
            type="checkbox"
            checked={item.have}
            onChange={() => toggleHave(i)}
            style={{
              accentColor: theme.primary,
              cursor: "pointer",
              width: 16,
              height: 16,
              flexShrink: 0,
            }}
            title={item.have ? "所持中" : "未所持"}
          />
          <span
            style={{
              cursor: "pointer",
              color: selectedItem === item.name ? theme.primary : theme.text,
              fontWeight: selectedItem === item.name ? 700 : 400,
              fontSize: "13px",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            onClick={() => handleSelect(item.name)}
            title={`クリックで選択: ${item.name}`}
          >
            {item.name}
          </span>
          {selectedItem === item.name && (
            <span style={{
              fontSize: "10px",
              color: theme.primary,
              backgroundColor: theme.activeBg,
              padding: "1px 5px",
              borderRadius: 4,
              flexShrink: 0,
            }}>選択中</span>
          )}
        </div>
      ))}

      <div style={{ marginTop: 8, fontSize: "11px", color: theme.textMuted }}>
        所持: {items.filter((i) => i.have).length} / {items.length} 件
      </div>
    </div>
  );
}

export default memo(DebugItems);
