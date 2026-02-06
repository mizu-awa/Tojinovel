import { styled } from "@mui/material";

export const VolumeSlider = styled("input")(({ trackStyle, thumbStyle }) => ({
  ...trackStyle,
  WebkitAppearance: "none",
  appearance: "none",
  width: "100%",
  outline: "none",
  cursor: "pointer",

  "&::-webkit-slider-thumb": {
    ...thumbStyle,
    WebkitAppearance: "none",
    appearance: "none",
    width: thumbStyle.size,
    height: thumbStyle.size,
    borderRadius: "50%",
    marginTop: trackStyle.height / 2 - thumbStyle.size / 2
  },

  "&::-moz-range-thumb": {
    ...thumbStyle,
    width: thumbStyle.size,
    height: thumbStyle.size,
    borderRadius: "50%",
  },

  "&::-webkit-slider-runnable-track": {
    ...trackStyle
  },


  "&::-moz-range-track": trackStyle
}));
