import { memo } from "react";

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "4px 0",
  borderBottom: "1px solid #e0e0e0",
};

const checkboxStyle = {
  accentColor: "#4bbeeb",
  cursor: "pointer",
  width: 16,
  height: 16,
  flexShrink: 0,
};

const nameStyle = (selected) => ({
  cursor: "pointer",
  color: selected ? "#4bbeeb" : "#333",
  fontWeight: selected ? 700 : 400,
  fontSize: "13px",
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const selectedBadgeStyle = {
  fontSize: "10px",
  color: "#4bbeeb",
  backgroundColor: "#e3f2fd",
  padding: "1px 5px",
  borderRadius: 4,
  flexShrink: 0,
};

function DebugItems({ items, selectedItem, selectItem, updateGameData }) {
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

  return (
    <div>
      {/* ヘッダー */}
      <div style={{ ...rowStyle, fontSize: "11px", color: "#999", fontWeight: 700 }}>
        <span style={{ width: 16 }}>所持</span>
        <span style={{ flex: 1 }}>アイテム名</span>
      </div>

      {items.map((item, i) => (
        <div key={item.name} style={rowStyle}>
          <input
            type="checkbox"
            checked={item.have}
            onChange={() => toggleHave(i)}
            style={checkboxStyle}
            title={item.have ? "所持中" : "未所持"}
          />
          <span
            style={nameStyle(selectedItem === item.name)}
            onClick={() => handleSelect(item.name)}
            title={`クリックで選択: ${item.name}`}
          >
            {item.name}
          </span>
          {selectedItem === item.name && (
            <span style={selectedBadgeStyle}>選択中</span>
          )}
        </div>
      ))}

      <div style={{ marginTop: 8, fontSize: "11px", color: "#999" }}>
        所持: {items.filter((i) => i.have).length} / {items.length} 件
      </div>
    </div>
  );
}

export default memo(DebugItems);
