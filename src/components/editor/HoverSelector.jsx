import { MenuItem, Select } from "@mui/material";
import { memo } from "react";

function HoverSelector({ value, onChange, "data-path": dataPath }) {
  const handleChange = (event) => {
    // datasetを作って handleDatasetChange に渡す
    const e = {
      target: {
        value: event.target.value,
        dataset: {
          path: dataPath
        }
      }
    };
    onChange?.(e);
  };

  return (
    <Select
      value={value ?? "none"}
      onChange={handleChange}
    >
      <MenuItem value="none">変化なし</MenuItem>
      <MenuItem value="hoverOp">透明度変化</MenuItem>
      {/*<MenuItem value="hoverZm">拡大</MenuItem>*/}
      <MenuItem value="hoverBt">明るくする</MenuItem>
      <MenuItem value="hoverDk">暗くする</MenuItem>
      <MenuItem value="hoverSp">発光</MenuItem>
      <MenuItem value="hoverSh">キラリ</MenuItem>
    </Select>
  );
}

export default memo(HoverSelector);
