import { useTheme } from "@emotion/react";

const FormField = ({ label, children }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        width: "100%",
        marginBottom: theme.spacing(1),
      }}
    >
      <label
        style={{
          display: "block",
          color: theme.palette.text.secondary,
          fontSize: "0.75rem",
          marginBottom: theme.spacing(0.5),
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
};

export default FormField;