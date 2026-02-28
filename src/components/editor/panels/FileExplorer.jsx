import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box, Button, Collapse, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Menu, MenuItem, Snackbar, TextField, Typography
} from "@mui/material";
import {
  AudioFile, ChevronRight, ContentCopy, CreateNewFolder, Delete,
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
  dragState, onDragStart, onDrop, onDropExternal,
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

  // 展開中にchildrenがnullにリセットされたとき（リフレッシュ後）に自動で再読み込み
  useEffect(() => {
    if (isDir && isOpen && children === null) {
      loadChildren();
    }
  }, [isDir, isOpen, children, loadChildren]);

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

    // カスタムドラッグプレビュー（ブラウザデフォルトのゴースト画像を置換）
    const el = document.createElement("div");
    el.textContent = name;
    el.style.cssText =
      "position:fixed;top:-100px;left:-100px;" +
      "padding:2px 8px;background:#424242;color:#fff;" +
      "border-radius:4px;font-size:12px;pointer-events:none;";
    document.body.appendChild(el);
    e.dataTransfer.setDragImage(el, 0, 0);
    setTimeout(() => document.body.removeChild(el), 0);

    onDragStart(relativePath);
  }, [relativePath, name, onDragStart]);

  // ドラッグオーバー（フォルダ: そのフォルダへ / ファイル: 親フォルダへ）
  const handleDragOver = useCallback((e) => {
    const hasExternalFiles = e.dataTransfer.types.includes("Files");
    // 外部ファイルはフォルダのみ受け付け
    if (hasExternalFiles && !isDir) return;
    if (!hasExternalFiles) {
      // 内部D&D: ドロップ先ディレクトリを計算（ファイルなら親フォルダ）
      const dragging = dragState.current;
      if (!dragging) return;
      const targetDir = isDir ? relativePath : (parentPath || "");
      if (dragging === targetDir || targetDir.startsWith(dragging + "/")) return;
      const fileName = dragging.split("/").pop();
      const destPath = targetDir ? `${targetDir}/${fileName}` : fileName;
      if (dragging === destPath) return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = hasExternalFiles ? "copy" : "move";
    setDragOver(true);
  }, [isDir, relativePath, parentPath, dragState]);

  const handleDragLeave = useCallback((e) => {
    e.stopPropagation();
    setDragOver(false);
  }, []);

  // ドロップ（移動 or 外部ファイル追加）
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    // 外部ファイルD&D（OSからのファイル）はフォルダのみ受け付け
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (!isDir) return;
      const files = Array.from(e.dataTransfer.files);
      const results = await Promise.allSettled(
        files.map(async (file) => {
          const destPath = `${relativePath}/${file.name}`;
          await storage.writeFileBlob(destPath, file);
          return destPath;
        })
      );
      const succeeded = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;
      onDropExternal(succeeded, failed);
      onRefresh();
      return;
    }

    // 内部D&D（ツリー内移動）
    const srcPath = e.dataTransfer.getData("text/plain");
    if (!srcPath) return;
    // ドロップ先ディレクトリ（ファイルノードなら親フォルダ）
    const targetDir = isDir ? relativePath : (parentPath || "");
    if (srcPath === targetDir || targetDir.startsWith(srcPath + "/")) return;

    const fileName = srcPath.split("/").pop();
    const destPath = targetDir ? `${targetDir}/${fileName}` : fileName;
    if (srcPath === destPath) return;

    try {
      await storage.renameFile(srcPath, destPath);
      onRefresh();
    } catch (err) {
      console.error("移動失敗:", err);
      alert(`移動に失敗しました: ${err}`);
    }
    onDrop();
  }, [isDir, relativePath, parentPath, onRefresh, onDrop, onDropExternal]);

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
                  onDropExternal={onDropExternal}
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
export default function FileExplorer({ onFileSelect, onFileChange }) {
  const [rootEntries, setRootEntries] = useState(null);
  const [loading, setLoading] = useState(true);

  // 選択中フォルダ（ファイル新規作成の対象）
  const [selectedFolder, setSelectedFolder] = useState("data/events");

  // 展開状態管理（パス -> 展開フラグ、sessionStorageで永続化）
  const [expandedPaths, setExpandedPaths] = useState(() => {
    try {
      const v = sessionStorage.getItem("explorerExpandedPaths");
      return v ? new Set(JSON.parse(v)) : new Set();
    } catch { return new Set(); }
  });

  const setExpandedPathsPersist = useCallback((newSet) => {
    setExpandedPaths(newSet);
    sessionStorage.setItem("explorerExpandedPaths", JSON.stringify([...newSet]));
  }, []);

  // ファイル作成ダイアログ
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("新規イベント.txt");
  const [createError, setCreateError] = useState("");

  // フォルダ作成ダイアログ
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderError, setCreateFolderError] = useState("");

  // D&D中のパスを追跡（refでリアルタイム参照）
  const dragState = useRef(null);

  // 外部ファイルD&Dオーバーレイ表示フラグ
  const [externalDragOver, setExternalDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  // オートスクロール用
  const scrollContainerRef = useRef(null);
  const scrollRafRef = useRef(null);

  // ヘッダードロップハイライト
  const [headerDragOver, setHeaderDragOver] = useState(false);

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

  // ドラッグ中のオートスクロール（キャプチャーフェーズで stopPropagation を回避）
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const ZONE = 40, SPEED = 8;

    const onDragOver = (e) => {
      const rect = container.getBoundingClientRect();
      cancelAnimationFrame(scrollRafRef.current);
      if (e.clientY < rect.top + ZONE) {
        const scroll = () => { container.scrollTop -= SPEED; scrollRafRef.current = requestAnimationFrame(scroll); };
        scrollRafRef.current = requestAnimationFrame(scroll);
      } else if (e.clientY > rect.bottom - ZONE) {
        const scroll = () => { container.scrollTop += SPEED; scrollRafRef.current = requestAnimationFrame(scroll); };
        scrollRafRef.current = requestAnimationFrame(scroll);
      }
    };
    const stopScroll = () => cancelAnimationFrame(scrollRafRef.current);

    container.addEventListener("dragover", onDragOver, { capture: true });
    container.addEventListener("dragleave", stopScroll, { capture: true });
    container.addEventListener("drop", stopScroll, { capture: true });
    container.addEventListener("dragend", stopScroll, { capture: true });
    return () => {
      container.removeEventListener("dragover", onDragOver, { capture: true });
      container.removeEventListener("dragleave", stopScroll, { capture: true });
      container.removeEventListener("drop", stopScroll, { capture: true });
      container.removeEventListener("dragend", stopScroll, { capture: true });
    };
  }, []);

  const handleRefresh = useCallback(() => {
    loadRoot();
    onFileChange?.();
  }, [loadRoot, onFileChange]);

  // functions-----

  const handleFolderSelect = useCallback((path) => {
    setSelectedFolder(path);
  }, []);

  const handleExpandedPathsChange = useCallback((newExpandedPaths) => {
    setExpandedPathsPersist(newExpandedPaths);
  }, [setExpandedPathsPersist]);

  const handleDragStart = useCallback((path) => {
    dragState.current = path;
  }, []);

  const handleDrop = useCallback(() => {
    dragState.current = null;
  }, []);

  // ヘッダーへのD&D（選択中フォルダへの移動）
  const handleHeaderDragOver = useCallback((e) => {
    if (e.dataTransfer.types.includes("Files")) return;
    const dragging = dragState.current;
    if (!dragging) return;
    const targetDir = selectedFolder || "";
    if (dragging === targetDir || targetDir.startsWith(dragging + "/")) return;
    const fileName = dragging.split("/").pop();
    const destPath = targetDir ? `${targetDir}/${fileName}` : fileName;
    if (dragging === destPath) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setHeaderDragOver(true);
  }, [dragState, selectedFolder]);

  const handleHeaderDragLeave = useCallback(() => {
    setHeaderDragOver(false);
  }, []);

  const handleHeaderDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeaderDragOver(false);
    if (e.dataTransfer.types.includes("Files")) return;
    const srcPath = e.dataTransfer.getData("text/plain");
    if (!srcPath) return;
    const targetDir = selectedFolder || "";
    if (srcPath === targetDir || targetDir.startsWith(srcPath + "/")) return;
    const fileName = srcPath.split("/").pop();
    const destPath = targetDir ? `${targetDir}/${fileName}` : fileName;
    if (srcPath === destPath) return;
    try {
      await storage.renameFile(srcPath, destPath);
      handleRefresh();
    } catch (err) {
      console.error("移動失敗:", err);
      alert(`移動に失敗しました: ${err}`);
    }
    handleDrop();
  }, [selectedFolder, handleRefresh, handleDrop, dragState]);

  // 外部ファイルD&D完了通知（TreeNodeから）
  const handleDropExternal = useCallback((succeeded, failed) => {
    const msg = failed > 0
      ? `${succeeded}件追加、${failed}件失敗`
      : `${succeeded}件のファイルを追加しました`;
    setImportSnack({ open: true, message: msg });
  }, []);

  // エリア全体へのD&Dハンドラ（ツリー以外の空白部分）
  const handleAreaDragEnter = useCallback((e) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    dragCounterRef.current += 1;
    setExternalDragOver(true);
  }, []);

  const handleAreaDragLeave = useCallback((e) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setExternalDragOver(false);
    }
  }, []);

  const handleAreaDragOver = useCallback((e) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleAreaDrop = useCallback(async (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setExternalDragOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const destDir = selectedFolder || "data";
    const files = Array.from(e.dataTransfer.files);
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const destPath = `${destDir}/${file.name}`;
        await storage.writeFileBlob(destPath, file);
        return destPath;
      })
    );
    const succeeded = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;
    const msg = failed > 0
      ? `${succeeded}件追加、${failed}件失敗`
      : `${succeeded}件のファイルを追加しました`;
    setImportSnack({ open: true, message: msg });
    handleRefresh();
  }, [selectedFolder, handleRefresh]);

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

  // フォルダ作成ダイアログを開く
  const handleOpenCreateFolderDialog = useCallback(() => {
    setNewFolderName("");
    setCreateFolderError("");
    setCreateFolderDialogOpen(true);
  }, []);

  // フォルダ作成実行
  const handleCreateFolder = useCallback(async () => {
    const fname = newFolderName.trim();
    if (!fname) {
      setCreateFolderError("フォルダ名を入力してください");
      return;
    }
    // フォルダ名にスラッシュや不正な文字がないか
    if (fname.includes("/") || fname.includes("\\")) {
      setCreateFolderError("フォルダ名にスラッシュは使えません");
      return;
    }

    const targetFolder = selectedFolder || "data";
    const folderPath = `${targetFolder}/${fname}`;

    try {
      await storage.createDir(folderPath);
      setCreateFolderDialogOpen(false);
      handleRefresh();
    } catch (e) {
      setCreateFolderError(String(e));
    }
  }, [newFolderName, selectedFolder, handleRefresh]);

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}
      onDragEnter={handleAreaDragEnter}
      onDragLeave={handleAreaDragLeave}
      onDragOver={handleAreaDragOver}
      onDrop={handleAreaDrop}
    >
      {/* ヘッダー（D&Dで選択中フォルダへ移動可能） */}
      <Box
        sx={{
          display: "flex", alignItems: "center", px: 1, py: 0.5,
          borderBottom: 1, borderColor: "divider",
          ...(headerDragOver && { bgcolor: "primary.dark", opacity: 0.85 }),
        }}
        onDragOver={handleHeaderDragOver}
        onDragLeave={handleHeaderDragLeave}
        onDrop={handleHeaderDrop}
      >
        <Typography variant="subtitle2" sx={{ flex: 1, color: "text.secondary", fontSize: "0.75rem" }}>
          {selectedFolder ? selectedFolder + "/" : "/"}
        </Typography>
        <IconButton size="small" onClick={handleImportFile} title="ファイルをインポート（選択フォルダへコピー）">
          <FileUpload fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleOpenCreateFolderDialog} title="新規フォルダ作成">
          <CreateNewFolder fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleOpenCreateDialog} title="新規txtファイル作成">
          <NoteAdd fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleRefresh} title="更新">
          <Refresh fontSize="small" />
        </IconButton>
      </Box>

      {/* 外部ファイルD&Dオーバーレイ */}
      {externalDragOver && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 10,
          bgcolor: "primary.main", opacity: 0.15,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }} />
      )}
      {externalDragOver && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 11,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <Typography variant="caption" sx={{
            color: "primary.light", fontWeight: "bold", textAlign: "center",
            bgcolor: "background.paper", px: 1.5, py: 0.75, borderRadius: 1,
            border: 2, borderColor: "primary.main", borderStyle: "dashed",
          }}>
            {selectedFolder || "data"} にドロップして追加
          </Typography>
        </Box>
      )}

      {/* ツリー */}
      <Box ref={scrollContainerRef} sx={{ flex: 1, overflowY: "auto" }}>
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
                onDropExternal={handleDropExternal}
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

      {/* フォルダ作成ダイアログ */}
      <Dialog
        open={createFolderDialogOpen}
        onClose={() => setCreateFolderDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>新規フォルダ作成</DialogTitle>
        <DialogContent>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
            作成場所: {selectedFolder || "data"}/
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="フォルダ名"
            value={newFolderName}
            onChange={(e) => {
              setNewFolderName(e.target.value);
              setCreateFolderError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") setCreateFolderDialogOpen(false);
            }}
            error={!!createFolderError}
            helperText={createFolderError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleCreateFolder} variant="contained">作成</Button>
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
