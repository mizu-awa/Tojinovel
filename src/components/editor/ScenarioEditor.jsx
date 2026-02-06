import { memo, useState, useCallback, useEffect, useRef } from "react";
import { Box, Typography, IconButton, TextField, Button } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Description, FolderOpen, Close, NoteAdd, Fullscreen, FullscreenExit } from "@mui/icons-material";

// CodeMirror
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { LanguageSupport } from "@codemirror/language";
import eventLanguage from "./codemirror/eventLanguage";
import { eventCompletionExtension } from "./codemirror/eventCompletion";
import { lightExtensions, darkExtensions } from "./codemirror/eventTheme";
import { closeBracketsExtension } from "./codemirror/eventBrackets";

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

// ラベル位置を検索してスクロール
function scrollToLabel(view, label) {
  if (!view || !label) return;

  const text = view.state.doc.toString();
  const labelPattern = `【${label}】`;
  const index = text.indexOf(labelPattern);

  if (index === -1) return;

  // その位置にスクロールしてカーソルを移動
  view.dispatch({
    selection: { anchor: index, head: index + labelPattern.length },
    scrollIntoView: true,
  });
  view.focus();
}

function ScenarioEditor({
  currentFilePath,
  currentLabel,
  editorViewRef,
  handleTextChange,
  status,
  loadEventFile,
  fileNotFound,
  createNewFile,
  closeFile,
  applyPendingContent,
  isMaximized,
  onToggleMaximize,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const editorContainerRef = useRef(null);
  const viewRef = useRef(null);
  const handleTextChangeRef = useRef(handleTextChange);
  const editorViewRefStable = useRef(editorViewRef);
  const applyPendingContentRef = useRef(applyPendingContent);

  // 手動入力用のローカルstate
  const [inputFilePath, setInputFilePath] = useState("");
  const [inputLabel, setInputLabel] = useState("");

  // handleTextChangeの最新値をrefに保持
  useEffect(() => {
    handleTextChangeRef.current = handleTextChange;
  }, [handleTextChange]);

  // editorViewRefの最新値をrefに保持
  useEffect(() => {
    editorViewRefStable.current = editorViewRef;
  }, [editorViewRef]);

  // applyPendingContentの最新値をrefに保持
  useEffect(() => {
    applyPendingContentRef.current = applyPendingContent;
  }, [applyPendingContent]);

  // CodeMirror エディタの初期化
  useEffect(() => {
    if (!editorContainerRef.current) return;

    // 既存のエディタがあれば破棄
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    // テキスト変更時のコールバック（refを使って最新のhandleTextChangeを呼び出す）
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        handleTextChangeRef.current();
      }
    });

    // 言語サポート
    const language = new LanguageSupport(eventLanguage);

    // エディタを作成
    const state = EditorState.create({
      doc: "",
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        language,
        eventCompletionExtension,
        closeBracketsExtension,
        updateListener,
        ...(isDark ? darkExtensions : lightExtensions),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorContainerRef.current,
    });

    viewRef.current = view;

    // 外部からアクセスできるようにrefに設定
    if (editorViewRefStable.current) {
      editorViewRefStable.current.current = view;
    }

    // pending contentがあれば適用
    if (applyPendingContentRef.current) {
      applyPendingContentRef.current();
    }

    return () => {
      view.destroy();
      viewRef.current = null;
      if (editorViewRefStable.current) {
        editorViewRefStable.current.current = null;
      }
    };
  }, [isDark]); // テーマ変更時に再作成

  // currentLabelが変わったらスクロール
  useEffect(() => {
    if (viewRef.current && currentLabel) {
      setTimeout(() => scrollToLabel(viewRef.current, currentLabel), 50);
    }
  }, [currentLabel, currentFilePath]);

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
    <Box sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: isMaximized ? "fixed" : "relative",
      top: isMaximized ? 0 : "auto",
      left: isMaximized ? 0 : "auto",
      right: isMaximized ? 0 : "auto",
      bottom: isMaximized ? 0 : "auto",
      zIndex: isMaximized ? 1300 : "auto",
      backgroundColor: theme.palette.background.paper,
    }}>
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
        {onToggleMaximize && (
          <IconButton
            size="small"
            onClick={onToggleMaximize}
            title={isMaximized ? "元に戻す" : "最大化"}
            sx={{ p: 0.5 }}
          >
            {isMaximized ? <FullscreenExit sx={{ fontSize: 18 }} /> : <Fullscreen sx={{ fontSize: 18 }} />}
          </IconButton>
        )}
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

      {/* エディタ / ファイル未存在メッセージ */}
      <Box sx={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {/* CodeMirrorエディタ（常にマウント、条件で表示/非表示） */}
        <Box
          ref={editorContainerRef}
          sx={{
            height: "100%",
            display: (currentFilePath && !fileNotFound) ? "block" : "none",
            "& .cm-editor": {
              height: "100%",
            },
            "& .cm-scroller": {
              overflow: "auto",
            },
          }}
        />

        {/* ファイルが存在しない場合 */}
        {currentFilePath && fileNotFound && (
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
        )}

        {/* ファイル未選択 */}
        {!currentFilePath && (
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
