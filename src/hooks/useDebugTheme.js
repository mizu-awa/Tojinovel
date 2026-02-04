import { useState, useEffect, useMemo } from "react";
import { getDesignTokens } from "../theme/Theme.jsx";

// デバッグオーバーレイ用の軽量テーマフック
// MUIのThemeProviderを使わず、システムのダーク/ライト設定に追従する
export default function useDebugTheme() {
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return useMemo(() => {
    const { palette } = getDesignTokens(isDark ? "dark" : "light");
    return {
      bg: palette.background.default,
      paper: palette.background.paper,
      text: palette.text.primary,
      textSecondary: palette.text.secondary,
      textMuted: isDark ? "#666" : "#999",
      primary: palette.primary.main,
      border: isDark ? "#333" : "#e0e0e0",
      inputBorder: isDark ? "#555" : "#c4c4c4",
      activeBg: isDark ? "#1a3a4a" : "#e3f2fd",
      muted: isDark ? "#555" : "#c4c4c4",
    };
  }, [isDark]);
}
