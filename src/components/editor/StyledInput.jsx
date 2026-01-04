import { styled } from "@mui/material";
import { forwardRef, memo } from "react";

export const BaseInput = styled("input")(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  padding: "6px 6px",
  margin: "1px",
  fontSize: "0.75rem",
  transition: "border-color 0.2s",
  width: "90%",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  "&:hover": { borderColor: theme.palette.text.primary },
  "&:focus": {
    borderColor: theme.palette.primary.main,
    borderWidth: "2px",
    outline: "none",
    margin: 0,
  },
}));

// inputPropsを展開できるラッパー
const StyledInputBase = forwardRef(function StyledInput(
  { inputProps, ...props },
  ref
) {
  return <BaseInput ref={ref} {...props} {...(inputProps || {})} />;
});

export const StyledInput = memo(StyledInputBase);