import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import { memo } from "react";

function TextAlignSelector({ value, onChange, ...props }) {
  const handleAlignmentChange = (event, newAlignment) => {
    if (newAlignment == null) return;

    // props から data-* を抽出して dataset に詰める
    const dataset = {};
    for (const key of Object.keys(props)) {
      if (key.startsWith("data-")) {
        const datasetKey = key
          .replace("data-", "")
          .replace(/-(.)/g, (_, c) => c.toUpperCase()); // data-path → path
        dataset[datasetKey] = props[key];
      }
    }

    // イベント風オブジェクトを作る
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
      {...props} // ← data-path をここで DOM にもつけておく（念のため）
      value={value}
      exclusive
      onChange={handleAlignmentChange}
      size="small"
      color="primary"
      aria-label="text alignment"
    >
      <ToggleButton value="left" aria-label="left aligned">
        <FormatAlignLeftIcon />
      </ToggleButton>
      <ToggleButton value="center" aria-label="center aligned">
        <FormatAlignCenterIcon />
      </ToggleButton>
      <ToggleButton value="right" aria-label="right aligned">
        <FormatAlignRightIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default memo(TextAlignSelector);