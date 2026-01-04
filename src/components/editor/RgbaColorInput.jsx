import { memo, useState } from "react";
import { Popover, Box } from "@mui/material";
import { RgbaColorPicker } from "react-colorful";

function RgbaColorInput({ value = "rgba(255,255,255,1)", onChange, ...props }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const colorObj = parseRgba(value);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChange = (newColor) => {
    const rgbaString = `rgba(${newColor.r}, ${newColor.g}, ${newColor.b}, ${newColor.a})`;

    // ---- イベントっぽいオブジェクトを作る ----
    const syntheticEvent = {
      target: {
        value: rgbaString,
        dataset: {
          path: props["data-path"], // ← 呼び出し側から渡す
        },
      },
    };

    onChange?.(syntheticEvent);
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: 18,
          borderRadius: 1,
          border: "1px solid #888",
          cursor: "pointer",
          backgroundColor: value,
        }}
        onClick={handleClick}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2 }}>
          <RgbaColorPicker color={colorObj} onChange={handleChange} />
        </Box>
      </Popover>
    </>
  );
}

function parseRgba(rgbaString) {
  const match = rgbaString.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  );
  return match
    ? {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: match[4] !== undefined ? Number(match[4]) : 1,
      }
    : { r: 255, g: 255, b: 255, a: 1 };
}

export default memo(RgbaColorInput);
