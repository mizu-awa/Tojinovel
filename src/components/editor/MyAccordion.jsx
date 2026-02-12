import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { ChevronRight } from "@mui/icons-material";

export default function MyAccordion({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const theme = useTheme();

  const textColor = theme.palette.text.primary;
  const borderColor = theme.palette.divider;

  return (
    <div style={{ borderBottom: `1px solid ${borderColor}` }}>
      {/* タイトル部分 */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "4px 8px",
          fontSize: "0.75em",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: textColor,
        }}
      >
        <span
          style={{
            display: "inline-block",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            marginRight: 4,
          }}
        >
          <ChevronRight sx={{ fontSize: "14px" }} />
        </span>
        {title}
      </button>

      {/* 開いているときだけマウント */}
      {open && (
        <div style={{ padding: "4px 8px", fontSize: "0.85em", color: textColor }}>
          {children}
        </div>
      )}
    </div>
  );
}