import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box, Collapse, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Menu, MenuItem, Snackbar, TextField, Typography
} from "@mui/material";
import {
  AudioFile, ChevronRight, ContentCopy, Delete,
  DriveFileRenameOutline, ExpandMore, Folder,
  FolderOpen, Image, InsertDriveFile, TextSnippet, Refresh
} from "@mui/icons-material";
import { storage } from "../../../services/storageService";

// ファイル拡張子からアイコンを取得
function getFileIcon(name, isDir) {
  if (isDir) return null; // フォルダアイコンは展開状態で変わるので呼び出し側で制御
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) return <Image fontSize="small" />;
  if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return <AudioFile fontSize="small" />;
  if (["txt"].includes(ext)) return <TextSnippet fontSize="small" />;
  if (["json"].includes(ext)) return <InsertDriveFile fontSize="small" color="primary" />;
  return <InsertDriveFile fontSize="small" />;
}

// ファイルツリーノード
function TreeNode({ name, isDir, parentPath, depth }) {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState(null);
  const [loading, setLoading] = useState(false);

  // リネーム状態
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(name);

  // 右クリックメニュー
  const [contextMenu, setContextMenu] = useState(null);

  // スナックバー（コピー通知）
  const [snackOpen, setSnackOpen] = useState(false);

  const relativePath = parentPath ? `${parentPath}/${name}` : name;

  // フォルダ展開
  const handleToggle = useCallback(async () => {
    if (!isDir) return;
    if (!open && children === null) {
      setLoading(true);
      try {
        const entries = await storage.readDir(relativePath);
        // フォルダ優先、名前順ソート
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
    }
    setOpen(!open);
  }, [isDir, open, children, relativePath]);

  // パスをクリップボードにコピー
  const handleCopyPath = useCallback(() => {
    const copyPath = "./" + relativePath;
    navigator.clipboard.writeText(copyPath);
    setSnackOpen(true);
    setContextMenu(null);
  }, [relativePath]);

  // ファイルクリック（パスコピー）
  const handleClick = useCallback(() => {
    if (isDir) {
      handleToggle();
    } else {
      handleCopyPath();
    }
  }, [isDir, handleToggle, handleCopyPath]);

  // 右クリック
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
  }, []);

  // 削除
  const handleDelete = useCallback(async () => {
    setContextMenu(null);
    if (!confirm(`「${name}」を削除しますか？`)) return;
    try {
      await storage.deleteFile(relativePath);
      // 親の再読み込みが必要だがシンプルにノード非表示にする
      // → 実際にはリフレッシュ機能で対応
    } catch (e) {
      console.error("削除失敗:", e);
    }
  }, [name, relativePath]);

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
    } catch (e) {
      console.error("リネーム失敗:", e);
    }
  }, [renameValue, name, relativePath, parentPath]);

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        sx={{ pl: 1 + depth * 2, py: 0.25, minHeight: 28 }}
      >
        {isDir && (
          <ListItemIcon sx={{ minWidth: 24 }}>
            {open ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
          </ListItemIcon>
        )}
        <ListItemIcon sx={{ minWidth: 28 }}>
          {isDir ? (open ? <FolderOpen fontSize="small" color="warning" /> : <Folder fontSize="small" color="warning" />) : getFileIcon(name)}
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
            primaryTypographyProps={{ fontSize: "0.8rem", noWrap: true }}
          />
        )}
      </ListItemButton>

      {/* 子要素 */}
      {isDir && (
        <Collapse in={open} timeout="auto" unmountOnExit>
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
                />
              ))}
            </List>
          )}
        </Collapse>
      )}

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
        <MenuItem onClick={handleDelete}>
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
export default function FileExplorer() {
  const [rootEntries, setRootEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  // リフレッシュ用のキー
  const refreshKeyRef = useRef(0);
  const [, forceUpdate] = useState(0);

  const loadRoot = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await storage.readDir("data");
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
    refreshKeyRef.current += 1;
    forceUpdate(n => n + 1);
    loadRoot();
  }, [loadRoot]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* ヘッダー */}
      <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 0.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" sx={{ flex: 1, color: "text.secondary" }}>
          data/
        </Typography>
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
          <List key={refreshKeyRef.current} dense disablePadding>
            {rootEntries?.map((entry) => (
              <TreeNode
                key={entry.name}
                name={entry.name}
                isDir={entry.isDir}
                parentPath="data"
                depth={0}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
