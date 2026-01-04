import { memo } from "react";
import { useTheme } from "@mui/material/styles";

const StyledCheckbox = memo(({ checked, onChange, ...props }) => {
  const theme = useTheme();

  // dataset を作って synthetic event を作る
  const handleChange = (e) => {
    const dataset = {};
    for (const key of Object.keys(props)) {
      if (key.startsWith("data-")) {
        const datasetKey = key
          .replace("data-", "")
          .replace(/-(.)/g, (_, c) => c.toUpperCase()); // data-path → path
        dataset[datasetKey] = props[key];
      }
    }

    const syntheticEvent = {
      target: {
        value: e.target.checked,
        dataset,
      },
    };

    onChange?.(syntheticEvent);
  };

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        style={{
          position: "absolute",
          opacity: 0,
          width: 0,
          height: 0,
        }}
      />
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: checked
            ? theme.palette.primary.main
            : theme.palette.background.paper,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.15s, border-color 0.15s",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.palette.text.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.palette.divider;
        }}
      >
        {checked && (
          <svg
            viewBox="0 0 24 24"
            style={{
              width: 14,
              height: 14,
              fill: "none",
              stroke: theme.palette.common.white,
              strokeWidth: 3,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
    </label>
  );
});

export default StyledCheckbox;
