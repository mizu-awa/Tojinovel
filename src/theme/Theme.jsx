export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: "#4bbeebff",
      contrastText: mode === "light" ? "#eee" : "#aaa"
    },
    secondary: {
      main: "#6d66eaff",
    },
    background: {
      default: mode === "light" ? "#f5f6fa" : "#121212",
      paper: mode === "light" ? "#ffffff" : "#1e1e1e",
    },
    text: {
      primary: mode === "light" ? "#222" : "#a5a5a5ff",
      secondary: mode === "light" ? "#555" : "#898989ff",
    },
  },

  typography: {
    fontSize: 13, // ベースを少し小さめに
    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.8rem" },
    subtitle1: { fontSize: "0.9rem", fontWeight: 500 },
    h6: { fontSize: "1rem", fontWeight: 600 },
  },

  components: {
    MuiTextField: {
      defaultProps: {
        size: "small",
        margin: "dense",
      },
      styleOverrides: {
        root: {
          padding: "0 6px", // よりコンパクトに
          width: "100%"
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small"
      },
      styleOverrides: {
        root: {
          height: "24px", // よりコンパクトに
          width: "100%",
          fontSize: "0.75rem",
          padding: 0,
          margin: "1px"
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          height: 24,      // デフォルトは約40px
          fontSize: "0.75rem",
          padding: "4px 8px",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          textTransform: "none", // ボタン文字の大文字化を防ぐ
          borderRadius: 6,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#333", // すべてのTypographyの基本色
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.75em", // すべてのTypographyの基本色
        },
      },
    },
     MuiToggleButton: {
      styleOverrides: {
        root: {
          minWidth: 36,    // デフォルトは約40px
          height: 36,      // デフォルトは約40px
          padding: "4px",  // 内側の余白も調整
          fontSize: "0.75rem", // 小さめ文字
        },
        sizeSmall: {
          minWidth: 24,
          height: 24,
          padding: "2px",
          fontSize: "0.7rem",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          height: 32,        // デフォルトは48px
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 8,
          paddingRight: 8
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        option: {
          minHeight: "28px", // 小さくする
          padding: "2px 8px",
          fontSize: "0.75rem",
        },
        paper: {
          marginTop: "2px",
        },
      },
    },
  },
});

