import { memo, useState, useCallback, useEffect, useRef } from "react";
import { Box, Typography, IconButton, TextField, Button } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import useFileList from "../../hooks/editor/useFileList";
import { Description, FolderOpen, Close, NoteAdd, Fullscreen, FullscreenExit, Undo, Redo, Warning } from "@mui/icons-material";

// CodeMirror
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab, undo as cmUndo, redo as cmRedo, undoDepth, redoDepth } from "@codemirror/commands";
import { LanguageSupport } from "@codemirror/language";
import eventLanguage from "./codemirror/eventLanguage";
import { createEventCompletionExtension } from "./codemirror/eventCompletion";
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
  ifViewWarning,
  isMaximized,
  onToggleMaximize,
  onFocusChange,
  sceneList,
  itemList,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const editorContainerRef = useRef(null);
  const viewRef = useRef(null);
  const handleTextChangeRef = useRef(handleTextChange);
  const editorViewRefStable = useRef(editorViewRef);
  const applyPendingContentRef = useRef(applyPendingContent);
  const onFocusChangeRef = useRef(onFocusChange);
  // history用Compartment（ファイル切替時にリセット）
  const historyCompartmentRef = useRef(new Compartment());

  // ファイルパス補完用
  const { fileList, ensureLoaded } = useFileList();
  const fileListRef = useRef(fileList);
  useEffect(() => { fileListRef.current = fileList; }, [fileList]);

  // シーン名・アイテム名補完用
  const sceneListRef = useRef(sceneList);
  useEffect(() => { sceneListRef.current = sceneList; }, [sceneList]);
  const itemListRef = useRef(itemList);
  useEffect(() => { itemListRef.current = itemList; }, [itemList]);

  // 手動入力用のローカルstate
  const [inputFilePath, setInputFilePath] = useState("");
  const [inputLabel, setInputLabel] = useState("");

  // CodeMirrorフォーカス状態
  const [isFocused, setIsFocused] = useState(false);

  // CMのUndo/Redo可否
  const [cmCanUndo, setCmCanUndo] = useState(false);
  const [cmCanRedo, setCmCanRedo] = useState(false);

  // refを最新値に同期
  useEffect(() => {
    handleTextChangeRef.current = handleTextChange;
  }, [handleTextChange]);

  useEffect(() => {
    editorViewRefStable.current = editorViewRef;
  }, [editorViewRef]);

  useEffect(() => {
    applyPendingContentRef.current = applyPendingContent;
  }, [applyPendingContent]);

  useEffect(() => {
    onFocusChangeRef.current = onFocusChange;
  }, [onFocusChange]);

  // CodeMirror エディタの初期化
  useEffect(() => {
    if (!editorContainerRef.current) return;

    // 既存のエディタがあれば破棄
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const historyCompartment = historyCompartmentRef.current;

    // テキスト変更時・undo/redo後のコールバック
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        handleTextChangeRef.current();
      }
      // CMのundo/redo可否を更新
      setCmCanUndo(undoDepth(update.state) > 0);
      setCmCanRedo(redoDepth(update.state) > 0);
    });

    // フォーカス/ブラー検出
    const focusListener = EditorView.domEventHandlers({
      focus: () => {
        setIsFocused(true);
        onFocusChangeRef.current?.(true);
      },
      blur: () => {
        setIsFocused(false);
        onFocusChangeRef.current?.(false);
      },
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
        historyCompartment.of(history()),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        language,
        createEventCompletionExtension(fileListRef, ensureLoaded, sceneListRef, itemListRef),
        closeBracketsExtension,
        updateListener,
        focusListener,
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

  // ファイルが変わったらCMの履歴をリセット
  useEffect(() => {
    if (viewRef.current && currentFilePath) {
      viewRef.current.dispatch({
        effects: historyCompartmentRef.current.reconfigure(history()),
      });
      setCmCanUndo(false);
      setCmCanRedo(false);
    }
  }, [currentFilePath]);

  // currentLabelが変わったらスクロール
  useEffect(() => {
    if (viewRef.current && currentLabel) {
      setTimeout(() => scrollToLabel(viewRef.current, currentLabel), 50);
    }
  }, [currentLabel, currentFilePath]);

  // CMのUndo/Redoボタンハンドラ
  const handleCmUndo = useCallback(() => {
    if (viewRef.current) cmUndo(viewRef.current);
  }, []);

  const handleCmRedo = useCallback(() => {
    if (viewRef.current) cmRedo(viewRef.current);
  }, []);

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
      {/* フォーカス時のアウトライン（CodeMirrorのスタッキングコンテキストより上に描画するため絶対配置） */}
      <Box sx={{
        position: "absolute",
        inset: 0,
        border: isFocused ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
        pointerEvents: "none",
        zIndex: 9999,
        transition: "border-color 0.15s",
      }} />
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
        {/* テキストUndo/Redoボタン */}
        <IconButton
          size="small"
          onClick={handleCmUndo}
          disabled={!cmCanUndo}
          title="テキストを元に戻す (Ctrl+Z)"
          sx={{ p: 0.5 }}
        >
          <Undo sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleCmRedo}
          disabled={!cmCanRedo}
          title="テキストをやり直し (Ctrl+Y)"
          sx={{ p: 0.5 }}
        >
          <Redo sx={{ fontSize: 18 }} />
        </IconButton>
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
          {ifViewWarning && (
            <Typography
              variant="caption"
              sx={{ color: "warning.main", display: "flex", alignItems: "center", gap: 0.25, whiteSpace: "nowrap" }}
            >
              <Warning sx={{ fontSize: 14 }} />
              #if条件次第でフロント/バック混在
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
