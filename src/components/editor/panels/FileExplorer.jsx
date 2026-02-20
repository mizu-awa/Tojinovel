import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box, Button, Collapse, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Menu, MenuItem, Snackbar, TextField, Typography
} from "@mui/material";
import {
  AudioFile, ChevronRight, ContentCopy, Delete,
  DriveFileRenameOutline, ExpandMore, Folder,
  FolderOpen, FileUpload, Image, InsertDriveFile, NoteAdd, Refresh, TextSnippet
} from "@mui/icons-material";
import { storage } from "../../../services/storageService";

// ファイル拡張子からアイコンを取得
function getFileIcon(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) return <Image fontSize="small" />;
  if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return <AudioFile fontSize="small" />;
  if (["txt"].includes(ext)) return <TextSnippet fontSize="small" />;
  if (["json"].includes(ext)) return <InsertDriveFile fontSize="small" color="primary" />;
  return <InsertDriveFile fontSize="small" />;
}

// ファイルツリーノード
function TreeNode({
  name, isDir, parentPath, depth, onFileSelect,
  selectedFolder, onFolderSelect, onRefresh,
  dragState, onDragStart, onDrop,
  expandedPaths, onExpandedPathsChange,
}) {
  const relativePath = parentPath ? `${parentPath}/${name}` : name;
  const isOpen = expandedPaths.has(relativePath);

  const [children, setChildren] = useState(null);
  const [loading, setLoading] = useState(false);

  // リネーム状態
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(name);

  // 右クリックメニュー
  const [contextMenu, setContextMenu] = useState(null);

  // D&Dハイライト（ドロップ対象フォルダ）
  const [dragOver, setDragOver] = useState(false);

  // スナックバー（コピー通知）
  const [snackOpen, setSnackOpen] = useState(false);

  // 削除確認ダイアログ
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isSelectedFolder = isDir && selectedFolder === relativePath;

  // フォルダ展開（子リスト読み込み）
  const loadChildren = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await storage.readDir(relativePath);
      const sorted = (entries || []).sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setChildren(sorted);
    } catch (e) {
      console.error("ReadDir失敗:", e);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, [relativePath]);

  const handleToggle = useCallback(async () => {
    if (!isDir) return;
    if (!isOpen && children === null) {
      await loadChildren();
    }
    const newExpandedPaths = new Set(expandedPaths);
    if (isOpen) {
      newExpandedPaths.delete(relativePath);
    } else {
      newExpandedPaths.add(relativePath);
    }
    onExpandedPathsChange(newExpandedPaths);
  }, [isDir, isOpen, children, loadChildren, relativePath, expandedPaths, onExpandedPathsChange]);

  // パスをクリップボードにコピー
  const handleCopyPath = useCallback(() => {
    navigator.clipboard.writeText("./" + relativePath);
    setSnackOpen(true);
    setContextMenu(null);
  }, [relativePath]);

  // クリック
  const handleClick = useCallback(() => {
    if (isDir) {
      handleToggle();
      onFolderSelect(relativePath);
    } else {
      handleCopyPath();
      if (onFileSelect) onFileSelect("./" + relativePath);
    }
  }, [isDir, handleToggle, handleCopyPath, onFileSelect, onFolderSelect, relativePath]);

  // 右クリック
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
  }, []);

  // 削除（confirm() はWails WebView2でブロックされる可能性があるためMUI Dialogを使用）
  const handleDelete = useCallback(() => {
    setContextMenu(null);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleteDialogOpen(false);
    try {
      await storage.deleteFile(relativePath);
      onRefresh();
    } catch (e) {
      console.error("削除失敗:", e);
    }
  }, [relativePath, onRefresh]);

  // リネーム開始
  const handleRenameStart = useCallback(() => {
    setContextMenu(null);
    setRenameValue(name);
    setRenaming(true);
  }, [name]);

  // リネーム確定
  const handleRenameConfirm = useCallback(async () => {
    setRenaming(false);
    if (renameValue === name || !renameValue.trim()) return;
    const newPath = parentPath ? `${parentPath}/${renameValue.trim()}` : renameValue.trim();
    try {
      await storage.renameFile(relativePath, newPath);
      onRefresh();
    } catch (e) {
      console.error("リネーム失敗:", e);
    }
  }, [renameValue, name, relativePath, parentPath, onRefresh]);

  // state-----

  // ドラッグ開始
  const handleDragStart = useCallback((e) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", relativePath);
    onDragStart(relativePath);
  }, [relativePath, onDragStart]);

  // ドラッグオーバー（フォルダのみ受け付け）
  const handleDragOver = useCallback((e) => {
    if (!isDir) return;
    // 自分自身または自分の子へのドロップは禁止
    const dragging = dragState.current;
    if (dragging && (dragging === relativePath || relativePath.startsWith(dragging + "/"))) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }, [isDir, relativePath, dragState]);

  const handleDragLeave = useCallback((e) => {
    e.stopPropagation();
    setDragOver(false);
  }, []);

  // ドロップ（移動実行）
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (!isDir) return;

    const srcPath = e.dataTransfer.getData("text/plain");
    if (!srcPath) return;
    // 自分自身や子へのドロップは無視
    if (srcPath === relativePath || relativePath.startsWith(srcPath + "/")) return;

    const fileName = srcPath.split("/").pop();
    const destPath = `${relativePath}/${fileName}`;
    if (srcPath === destPath) return;

    try {
      await storage.renameFile(srcPath, destPath);
      onRefresh();
    } catch (e) {
      console.error("移動失敗:", e);
      alert(`移動に失敗しました: ${e}`);
    }
    onDrop();
  }, [isDir, relativePath, onRefresh, onDrop]);

  const handleDragEnd = useCallback(() => {
    onDrop();
  }, [onDrop]);

  // リフレッシュ時に子リストをリセット
  const handleChildRefresh = useCallback(() => {
    setChildren(null);
    onRefresh();
  }, [onRefresh]);

  return (
    <>
      <ListItemButton
        draggable
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          pl: 1 + depth * 2, py: 0.25, minHeight: 28,
          ...(isSelectedFolder && { bgcolor: "action.selected" }),
          ...(dragOver && { bgcolor: "primary.dark", opacity: 0.85 }),
        }}
      >
        {isDir && (
          <ListItemIcon sx={{ minWidth: 24 }}>
            {isOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
          </ListItemIcon>
        )}
        <ListItemIcon sx={{ minWidth: 28 }}>
          {isDir
            ? (isOpen ? <FolderOpen fontSize="small" color="warning" /> : <Folder fontSize="small" color="warning" />)
            : getFileIcon(name)}
        </ListItemIcon>
        {renaming ? (
          <TextField
            size="small"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameConfirm}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameConfirm();
              if (e.key === "Escape") setRenaming(false);
            }}
            autoFocus
            variant="standard"
            sx={{ flex: 1 }}
          />
        ) : (
          <ListItemText
            primary={name}
            slotProps={{ primary: { fontSize: "0.8rem", noWrap: true } }}
          />
        )}
      </ListItemButton>

      {/* 子要素 */}
      {isDir && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          {loading ? (
            <Typography variant="caption" sx={{ pl: 3 + depth * 2, color: "text.disabled" }}>
              読み込み中...
            </Typography>
          ) : (
            <List disablePadding>
              {children?.map((child) => (
                <TreeNode
                  key={child.name}
                  name={child.name}
                  isDir={child.isDir}
                  parentPath={relativePath}
                  depth={depth + 1}
                  onFileSelect={onFileSelect}
                  selectedFolder={selectedFolder}
                  onFolderSelect={onFolderSelect}
                  onRefresh={handleChildRefresh}
                  dragState={dragState}
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                  expandedPaths={expandedPaths}
                  onExpandedPathsChange={onExpandedPathsChange}
                />
              ))}
            </List>
          )}
        </Collapse>
      )}

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <Typography>「{name}」を削除しますか？この操作は取り消せません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">削除</Button>
        </DialogActions>
      </Dialog>

      {/* 右クリックメニュー */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        <MenuItem onClick={handleCopyPath}>
          <ContentCopy fontSize="small" sx={{ mr: 1 }} /> パスをコピー
        </MenuItem>
        <MenuItem onClick={handleRenameStart}>
          <DriveFileRenameOutline fontSize="small" sx={{ mr: 1 }} /> リネーム
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> 削除
        </MenuItem>
      </Menu>

      {/* コピー通知 */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={1500}
        onClose={() => setSnackOpen(false)}
        message={`コピーしました: ./${relativePath}`}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}

// メインのファイルエクスプローラーコンポーネント
export default function FileExplorer({ onFileSelect }) {
  const [rootEntries, setRootEntries] = useState(null);
  const [loading, setLoading] = useState(true);

  // 選択中フォルダ（ファイル新規作成の対象）
  const [selectedFolder, setSelectedFolder] = useState("data/events");

  // 展開状態管理（パス -> 展開フラグ）
  const [expandedPaths, setExpandedPaths] = useState(new Set());

  // ファイル作成ダイアログ
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("新規イベント.txt");
  const [createError, setCreateError] = useState("");

  // D&D中のパスを追跡（refでリアルタイム参照）
  const dragState = useRef(null);

  const loadRoot = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await storage.readDir("");
      const sorted = (entries || []).sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setRootEntries(sorted);
    } catch (e) {
      console.error("ルートディレクトリ読み込み失敗:", e);
      setRootEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRoot(); }, [loadRoot]);

  const handleRefresh = useCallback(() => {
    loadRoot();
  }, [loadRoot]);

  // functions-----

  const handleFolderSelect = useCallback((path) => {
    setSelectedFolder(path);
  }, []);

  const handleExpandedPathsChange = useCallback((newExpandedPaths) => {
    setExpandedPaths(newExpandedPaths);
  }, []);

  const handleDragStart = useCallback((path) => {
    dragState.current = path;
  }, []);

  const handleDrop = useCallback(() => {
    dragState.current = null;
  }, []);

  // インポートスナックバー
  const [importSnack, setImportSnack] = useState({ open: false, message: "" });

  // ファイルインポート（選択フォルダへダイアログ経由でコピー）
  const handleImportFile = useCallback(async () => {
    const destDir = selectedFolder || "data";
    try {
      const relPath = await storage.importFile(destDir);
      if (relPath) {
        setImportSnack({ open: true, message: `インポート完了: ${relPath}` });
        handleRefresh();
        // テキストファイルはエディタで開く
        if (onFileSelect && relPath.endsWith(".txt")) onFileSelect(relPath);
      }
    } catch (e) {
      setImportSnack({ open: true, message: `インポート失敗: ${e}` });
    }
  }, [selectedFolder, handleRefresh, onFileSelect]);

  // ファイル作成ダイアログを開く
  const handleOpenCreateDialog = useCallback(() => {
    setNewFileName("新規イベント.txt");
    setCreateError("");
    setCreateDialogOpen(true);
  }, []);

  // ファイル作成実行
  const handleCreateFile = useCallback(async () => {
    let fname = newFileName.trim();
    if (!fname) {
      setCreateError("ファイル名を入力してください");
      return;
    }
    // .txt 拡張子を自動付与
    if (!fname.includes(".")) {
      fname = fname + ".txt";
    }

    const targetFolder = selectedFolder || "data/events";
    const filePath = `${targetFolder}/${fname}`;

    try {
      await storage.createFile(filePath);
      setCreateDialogOpen(false);
      handleRefresh();
      // 作成したファイルをエディタで開く
      if (onFileSelect) onFileSelect(`./${filePath}`);
    } catch (e) {
      setCreateError(String(e));
    }
  }, [newFileName, selectedFolder, handleRefresh, onFileSelect]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* ヘッダー */}
      <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 0.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" sx={{ flex: 1, color: "text.secondary", fontSize: "0.75rem" }}>
          {selectedFolder ? selectedFolder + "/" : "/"}
        </Typography>
        <IconButton size="small" onClick={handleImportFile} title="ファイルをインポート（選択フォルダへコピー）">
          <FileUpload fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleOpenCreateDialog} title="新規txtファイル作成">
          <NoteAdd fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleRefresh} title="更新">
          <Refresh fontSize="small" />
        </IconButton>
      </Box>

      {/* ツリー */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <Typography variant="body2" sx={{ p: 2, color: "text.disabled" }}>読み込み中...</Typography>
        ) : rootEntries?.length === 0 ? (
          <Typography variant="body2" sx={{ p: 2, color: "text.disabled" }}>ファイルがありません</Typography>
        ) : (
          <List dense disablePadding>
            {rootEntries?.map((entry) => (
              <TreeNode
                key={entry.name}
                name={entry.name}
                isDir={entry.isDir}
                parentPath=""
                depth={0}
                onFileSelect={onFileSelect}
                selectedFolder={selectedFolder}
                onFolderSelect={handleFolderSelect}
                onRefresh={handleRefresh}
                dragState={dragState}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                expandedPaths={expandedPaths}
                onExpandedPathsChange={handleExpandedPathsChange}
              />
            ))}
          </List>
        )}
      </Box>

      {/* ファイル作成ダイアログ */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>新規ファイル作成</DialogTitle>
        <DialogContent>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
            作成場所: {selectedFolder || "data/events"}/（フォルダを選択してから作成してください）
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="ファイル名"
            value={newFileName}
            onChange={(e) => {
              setNewFileName(e.target.value);
              setCreateError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFile();
              if (e.key === "Escape") setCreateDialogOpen(false);
            }}
            error={!!createError}
            helperText={createError || "拡張子なしの場合 .txt を自動付与します"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleCreateFile} variant="contained">作成</Button>
        </DialogActions>
      </Dialog>

      {/* インポート通知 */}
      <Snackbar
        open={importSnack.open}
        autoHideDuration={3000}
        onClose={() => setImportSnack(s => ({ ...s, open: false }))}
        message={importSnack.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
