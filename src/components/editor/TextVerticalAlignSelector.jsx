import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import VerticalAlignCenterIcon from "@mui/icons-material/VerticalAlignCenter";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import { memo } from "react";

function TextVerticalAlignSelector({ value, onChange, ...props }) {
  const handleVerticalAlignmentChange = (event, newAlignment) => {
    if (newAlignment == null) return;

    // props から data-* を抽出して dataset に変換
    const dataset = {};
    for (const key of Object.keys(props)) {
      if (key.startsWith("data-")) {
        const datasetKey = key
          .replace("data-", "")
          .replace(/-(.)/g, (_, c) => c.toUpperCase()); // data-path → path
        dataset[datasetKey] = props[key];
      }
    }

    // synthetic event 形式に変換
    const syntheticEvent = {
      target: {
        value: newAlignment,
        dataset,
      },
    };

    onChange?.(syntheticEvent);
  };

  return (
    <ToggleButtonGroup
      {...props} // ← data-path を DOM にも載せておく
      value={value}
      exclusive
      onChange={handleVerticalAlignmentChange}
      size="small"
      color="primary"
      aria-label="vertical alignment"
    >
      <ToggleButton value="flex-start" aria-label="align top">
        <VerticalAlignTopIcon />
      </ToggleButton>
      <ToggleButton value="center" aria-label="align middle">
        <VerticalAlignCenterIcon />
      </ToggleButton>
      <ToggleButton value="flex-end" aria-label="align bottom">
        <VerticalAlignBottomIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default memo(TextVerticalAlignSelector);