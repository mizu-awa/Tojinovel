import { memo, useState } from "react";

function DebugVariables({ variables, updateGameData, theme }) {
  const [filter, setFilter] = useState("");

  // 変数の値を更新
  const handleValueChange = (index, newValue) => {
    updateGameData((prev) => {
      const next = { ...prev };
      next.variables = [...next.variables];
      next.variables[index] = { ...next.variables[index], value: newValue };
      return next;
    });
  };

  const filtered = filter
    ? variables.filter((v) => v.name.includes(filter))
    : variables;

  // スタイル
  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 4,
    alignItems: "center",
    padding: "3px 0",
    borderBottom: `1px solid ${theme.border}`,
  };

  const inputStyle = {
    backgroundColor: theme.paper,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 4,
    color: theme.text,
    padding: "3px 6px",
    fontSize: "12px",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div>
      {/* フィルター */}
      <input
        type="text"
        placeholder="変数名で検索..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ ...inputStyle, marginBottom: 8, width: "100%" }}
      />

      {/* ヘッダー */}
      <div style={{ ...rowStyle, fontWeight: 700, fontSize: "11px", color: theme.textMuted }}>
        <span>名前</span>
        <span>値</span>
      </div>

      {/* 変数一覧 */}
      {filtered.map((v, i) => {
        // フィルタ中は元のindexを使う
        const originalIndex = filter
          ? variables.findIndex((orig) => orig === v)
          : i;
        return (
          <div key={originalIndex} style={rowStyle}>
            <span style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "12px",
              color: theme.text,
            }} title={v.name}>{v.name}</span>
            <input
              style={inputStyle}
              value={String(v.value)}
              onChange={(e) => handleValueChange(originalIndex, e.target.value)}
            />
          </div>
        );
      })}

      {/* 件数表示 */}
      <div style={{ marginTop: 8, fontSize: "11px", color: theme.textMuted }}>
        {filtered.length} / {variables.length} 件
      </div>
    </div>
  );
}

export default memo(DebugVariables);
