import { memo } from "react";
import { useTheme } from "@mui/material/styles";

const SectionDivider = memo(({ style }) => {
  const theme = useTheme();

  return (
    <hr
      style={{
        border: "none",
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: "8px 0",
        ...style,
      }}
    />
  );
});

export default SectionDivider;