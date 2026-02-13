import { Autocomplete, TextField } from "@mui/material";
import { memo } from "react";

const FONT_OPTIONS = [
  "system-ui",
  "Noto Sans JP",
  "Noto Serif JP",
  "M PLUS Rounded 1c",
  "M PLUS 1p",
  "Kosugi Maru",
  "Sawarabi Gothic",
  "Sawarabi Mincho",
  "Zen Maru Gothic",
  "Zen Kaku Gothic New",
];

function FontSelector({ value, onChange, "data-path": dataPath, freeSolo = true }) {
  const handleChange = (event, newValue) => {
    const e = {
      target: {
        value: newValue || "",
        dataset: {
          path: dataPath
        }
      }
    };
    onChange?.(e);
  };

  return (
    <Autocomplete
      value={value || ""}
      onChange={handleChange}
      options={FONT_OPTIONS}
      freeSolo={freeSolo}
      renderInput={(params) => <TextField {...params} size="small" />}
    />
  );
}

export default memo(FontSelector);
