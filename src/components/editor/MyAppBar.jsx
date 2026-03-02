import { Download, FileDownload, FolderOpen, Html, PlayArrow, Redo, Save, Undo } from "@mui/icons-material";
import { AppBar, Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar, Toolbar, Typography } from "@mui/material"
import { memo, useCallback, useState } from "react";
import { storage } from "../../services/storageService";

const MyAppBar = memo(({save, isSaved, undo, redo, canUndo, canRedo, onBackToProjectSelect}) => {
  const isWails = !!window?.go;

  // エクスポート通知
  const [snack, setSnack] = useState({ open: false, message: "" });

  // エクスポートメニュー
  const [exportAnchor, setExportAnchor] = useState(null);

  // デバッグプレイ: gamedata.json + イベントファイルを全保存してからデバッグモードに遷移
  const handleDebugPlay = useCallback(async () => {
    await save();
    window.location.search = "?debug";
  }, [save]);

  // プロジェクト選択画面に戻る: 保存してから戻る
  const handleBackToProjectSelect = useCallback(async () => {
    await save();
    onBackToProjectSelect();
  }, [save, onBackToProjectSelect]);

  // ゲーム出力 (HTML) — Wails版: フォルダに直接書き出し
  const handleExportPlayerWails = useCallback(async () => {
    setExportAnchor(null);
    try {
      await save();
      await storage.exportPlayer();
      setSnack({ open: true, message: "index.html と assets/ を書き出しました" });
    } catch (e) {
      setSnack({ open: true, message: `書き出し失敗: ${e}` });
    }
  }, [save]);

  // ゲーム出力 (HTML) — ブラウザ版: ZIPダウンロード
  const handleExportPlayerBrowser = useCallback(async () => {
    setExportAnchor(null);
    try {
      await save();
      const { exportPlayerAsZip } = await import("../../services/playerExportService.js");
      const projectPath = storage.getCurrentProjectPath();
      const projectName = await storage.getCurrentProjectName() || "game";
      await exportPlayerAsZip(projectPath, projectName);
      setSnack({ open: true, message: "ゲームをZIPで出力しました" });
    } catch (e) {
      setSnack({ open: true, message: `ゲーム出力失敗: ${e}` });
    }
  }, [save]);

  // プロジェクトZIPエクスポート（ブラウザ版のみ）
  const handleExportZip = useCallback(async () => {
    setExportAnchor(null);
    try {
      await save();
      const { exportProjectAsZip } = await import("../../services/zipService.js");
      const projectPath = storage.getCurrentProjectPath();
      const projectName = await storage.getCurrentProjectName() || "project";
      await exportProjectAsZip(projectPath, projectName);
      setSnack({ open: true, message: "ZIPファイルをエクスポートしました" });
    } catch (e) {
      setSnack({ open: true, message: `ZIPエクスポート失敗: ${e}` });
    }
  }, [save]);

  return(
    <AppBar position="static" color="secondary">
      <Toolbar>
        <Typography variant="h5" sx={{ color: "primary.contrastText" }}>
          Tojinovel Editor {!isSaved && "*"}
        </Typography>
        <Typography sx={{ color: "primary.contrastText", flexGrow: 1 }} pl={1}>
          ver :{ import.meta.env.VITE_RELEASE_VERSION ?? ( import.meta.env.VITE_COMMIT_HASH ?? "dev" ) }
        </Typography>

        <Box sx={{display: "flex", alignItems: "center"}}>
          <IconButton onClick={undo} disabled={!canUndo} title="元に戻す (Ctrl+Z)" sx={{color: "primary.contrastText", "&.Mui-disabled": {color: "action.disabled"}}}>
            <Undo />
          </IconButton>
          <IconButton onClick={redo} disabled={!canRedo} title="やり直し (Ctrl+Y)" sx={{color: "primary.contrastText", "&.Mui-disabled": {color: "action.disabled"}}}>
            <Redo />
          </IconButton>
          <IconButton onClick={save} title="保存 (Ctrl+S)" sx={{color: "primary.contrastText"}}>
            <Save />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(255,255,255,0.3)" }} />
          <IconButton onClick={handleDebugPlay} title="デバッグプレイ" sx={{color: "primary.contrastText"}}>
            <PlayArrow />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(255,255,255,0.3)" }} />
          <IconButton onClick={(e) => setExportAnchor(e.currentTarget)} title="エクスポート" sx={{color: "primary.contrastText"}}>
            <FileDownload />
          </IconButton>
          <Menu anchorEl={exportAnchor} open={!!exportAnchor} onClose={() => setExportAnchor(null)}>
            {isWails ? (
              <MenuItem onClick={handleExportPlayerWails}>
                <ListItemIcon><Html fontSize="small" /></ListItemIcon>
                <ListItemText>ゲーム出力 (HTML)</ListItemText>
              </MenuItem>
            ) : (
              [
                <MenuItem key="player" onClick={handleExportPlayerBrowser}>
                  <ListItemIcon><Html fontSize="small" /></ListItemIcon>
                  <ListItemText>ゲーム出力 (HTML)</ListItemText>
                </MenuItem>,
                <MenuItem key="zip" onClick={handleExportZip}>
                  <ListItemIcon><Download fontSize="small" /></ListItemIcon>
                  <ListItemText>プロジェクトZIP</ListItemText>
                </MenuItem>,
              ]
            )}
          </Menu>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(255,255,255,0.3)" }} />
          <IconButton onClick={handleBackToProjectSelect} title="プロジェクト選択に戻る" sx={{color: "primary.contrastText"}}>
            <FolderOpen />
          </IconButton>
        </Box>
      </Toolbar>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        message={snack.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </AppBar>
  )
})

export default MyAppBar;
