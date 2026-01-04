import { FormControl, Select, MenuItem, FormLabel } from "@mui/material";
import { memo } from "react";

const borderStyles = [
  "solid",
  "dashed",
  "dotted",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset",
  "none",
];

function BorderStyleSelect({ value, onChange, label, ...props }) {
  const handleChange = (event) => {
    // props から data-* を抽出して dataset を作る
    const dataset = {};
    for (const key of Object.keys(props)) {
      if (key.startsWith("data-")) {
        const datasetKey = key
          .replace("data-", "")
          .replace(/-(.)/g, (_, c) => c.toUpperCase()); // data-path → path
        dataset[datasetKey] = props[key];
      }
    }

    // MUI Select の event.target.value を取り出す
    const newValue = event.target.value;

    // synthetic event を渡す
    const syntheticEvent = {
      target: {
        value: newValue,
        dataset,
      },
    };

    onChange?.(syntheticEvent);
  };

  return (
    <FormControl fullWidth margin="dense">
      <FormLabel>{label}</FormLabel>

      <Select
        {...props}       // data-path を DOM にも渡す
        value={value}
        onChange={handleChange}
      >
        {borderStyles.map((style) => (
          <MenuItem key={style} value={style}>
            {style}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default memo(BorderStyleSelect);