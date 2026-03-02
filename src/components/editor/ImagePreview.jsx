import { Box, Typography } from "@mui/material";

// 画像プレビューコンポーネント
export default function ImagePreview({ filePath }) {
  if (!filePath) return null;

  return (
    <Box sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      p: 2,
    }}>
      <Typography variant="caption" sx={{ mb: 1, color: "text.secondary" }}>
        {filePath}
      </Typography>
      <Box sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
      }}>
        <img
          src={filePath}
          alt={filePath}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
    </Box>
  );
}
