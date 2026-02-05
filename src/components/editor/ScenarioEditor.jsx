import { memo, useState, useCallback } from "react";
import { Box, Typography, IconButton, TextField, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Description, FolderOpen, Close, NoteAdd } from "@mui/icons-material";

// テーマ対応のtextarea
const StyledTextarea = styled("textarea")(({ theme }) => ({
  width: "100%",
  height: "100%",
  resize: "none",
  border: "none",
  outline: "none",
  padding: "8px",
  fontSize: "13px",
  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
  lineHeight: 1.5,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxSizing: "border-box",
  tabSize: 2,
  "&::placeholder": {
    color: theme.palette.text.disabled,
  },
}));

// 小さめのテキストフィールド
const SmallTextField = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    fontSize: "0.75rem",
    height: "24px",
  },
  "& .MuiInputBase-input": {
    padding: "2px 6px",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.7rem",
    transform: "translate(8px, 5px) scale(1)",
    "&.MuiInputLabel-shrink": {
      transform: "translate(8px, -9px) scale(0.85)",
    },
  },
}));

function ScenarioEditor({
  currentFilePath,
  currentLabel,
  textareaRef,
  handleTextChange,
  status,
  loadEventFile,
  fileNotFound,
  createNewFile,
  closeFile,
}) {
  // 手動入力用のローカルstate
  const [inputFilePath, setInputFilePath] = useState("");
  const [inputLabel, setInputLabel] = useState("");

  // ファイルを開く
  const handleOpen = useCallback(() => {
    if (inputFilePath.trim()) {
      loadEventFile(inputFilePath.trim(), inputLabel.trim());
    }
  }, [inputFilePath, inputLabel, loadEventFile]);

  // Enterキーで開く
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleOpen();
    }
  }, [handleOpen]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* 手動入力フォーム */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderBottom: 1,
        borderColor: "divider",
        minHeight: 32,
        flexWrap: "wrap",
      }}>
        <SmallTextField
          size="small"
          placeholder="events/sample.txt"
          value={inputFilePath}
          onChange={(e) => setInputFilePath(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ flex: 1, minWidth: 120 }}
        />
        <SmallTextField
          size="small"
          placeholder="ラベル"
          value={inputLabel}
          onChange={(e) => setInputLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ width: 80 }}
        />
        <IconButton
          size="small"
          onClick={handleOpen}
          title="ファイルを開く"
          sx={{ p: 0.5 }}
        >
          <FolderOpen sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* 現在のファイル情報ヘッダー */}
      {currentFilePath && (
        <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.25,
          borderBottom: 1,
          borderColor: "divider",
          minHeight: 28,
          backgroundColor: "action.hover",
        }}>
          <Description sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography variant="caption" sx={{ color: "text.primary", flexGrow: 1, fontWeight: 500 }} noWrap>
            {currentFilePath.replace(/^\.\//, "")}
            {currentLabel && <span style={{ color: "gray" }}> [{currentLabel}]</span>}
          </Typography>
          {status && (
            <Typography variant="caption" sx={{ color: fileNotFound ? "error.main" : "text.disabled" }}>
              {status}
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={closeFile}
            title="閉じる"
            sx={{ p: 0.25 }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

      {/* テキストエリア / ファイル未存在メッセージ */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {currentFilePath ? (
          fileNotFound ? (
            // ファイルが存在しない場合
            <Box sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              color: "text.disabled",
              fontSize: "0.85rem",
            }}>
              <Typography color="error">ファイルが存在しません</Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {currentFilePath.replace(/^\.\//, "")}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<NoteAdd />}
                onClick={createNewFile}
              >
                新規ファイルを作成
              </Button>
            </Box>
          ) : (
            // 通常のテキストエリア
            <StyledTextarea
              ref={textareaRef}
              onInput={handleTextChange}
              placeholder="イベントテキストを入力..."
              spellCheck={false}
            />
          )
        ) : (
          // ファイル未選択
          <Box sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.disabled",
            fontSize: "0.85rem",
          }}>
            ファイルパスを入力して開くボタンをクリックしてください
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default memo(ScenarioEditor);
