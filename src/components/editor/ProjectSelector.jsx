import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box, Button, Card, CardActionArea, CardContent,
  Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText,
  TextField, Tooltip, Typography
} from "@mui/material";
import { Add, Delete, Download, FolderOpen, Folder, Upload, Warning } from "@mui/icons-material";
import { storage } from "../../services/storageService";

const isBrowser = import.meta.env.VITE_BUILD_MODE === "browser";

// プロジェクト選択画面
export default function ProjectSelector({ onProjectReady }) {
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 削除確認ダイアログ
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 新規作成ダイアログ
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectParent, setNewProjectParent] = useState("");

  // ストレージ情報（ブラウザ版のみ）
  const [storageInfo, setStorageInfo] = useState(null);

  // 初期ロード
  useEffect(() => {
    (async () => {
      try {
        const projects = await storage.listProjects();
        setRecentProjects(projects || []);

        // ブラウザ版: ストレージ使用量を取得
        if (isBrowser && navigator.storage?.estimate) {
          const estimate = await navigator.storage.estimate();
          setStorageInfo(estimate);
        }
      } catch (e) {
        console.error("プロジェクト一覧の取得に失敗:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // プロジェクトを開く
  const handleOpenProject = useCallback(async (path) => {
    try {
      setError(null);
      await storage.openProject(path);
      onProjectReady(path);
    } catch (e) {
      setError("プロジェクトを開けませんでした: " + e.message);
    }
  }, [onProjectReady]);

  // フォルダ選択ダイアログ（Wails版のみ）
  const handleSelectFolder = useCallback(async () => {
    try {
      setError(null);
      const dir = await storage.selectProjectDialog();
      if (dir) {
        await storage.openProject(dir);
        onProjectReady(dir);
      }
    } catch (e) {
      setError("プロジェクトを開けませんでした: " + e.message);
    }
  }, [onProjectReady]);

  // 新規作成ダイアログ: 親フォルダ選択（Wails版のみ）
  const handleSelectParent = useCallback(async () => {
    try {
      const dir = await storage.selectNewProjectParentDialog();
      if (dir) {
        setNewProjectParent(dir);
      }
    } catch (e) {
      console.error("フォルダ選択に失敗:", e);
    }
  }, []);

  // 新規プロジェクト作成
  const handleCreateProject = useCallback(async () => {
    if (!newProjectName.trim()) return;
    // Wails版は親ディレクトリ必須
    if (!isBrowser && !newProjectParent) return;
    try {
      setError(null);
      const createdPath = isBrowser
        ? await storage.createProject(newProjectName.trim())
        : await storage.createProject(newProjectName.trim(), newProjectParent);
      setNewDialogOpen(false);
      onProjectReady(createdPath);
    } catch (e) {
      setError("プロジェクト作成に失敗: " + e.message);
    }
  }, [newProjectName, newProjectParent, onProjectReady]);

  // ZIPエクスポート（ブラウザ版のみ）
  const handleExportProject = useCallback(async (e, project) => {
    e.stopPropagation();
    try {
      setError(null);
      const { exportProjectAsZip } = await import("../../services/zipService.js");
      await exportProjectAsZip(project.path, project.name);
    } catch (err) {
      setError("エクスポートに失敗: " + err.message);
    }
  }, []);

  // ZIPインポート（ブラウザ版のみ）
  const handleImportZip = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip";
    input.onchange = async () => {
      if (!input.files?.[0]) return;
      try {
        setError(null);
        setLoading(true);
        const { importProjectFromZip } = await import("../../services/zipService.js");
        const project = await importProjectFromZip(input.files[0]);
        await storage.openProject(project.id);
        setLoading(false);
        onProjectReady(project.id);
      } catch (err) {
        setError("インポートに失敗: " + err.message);
        setLoading(false);
      }
    };
    input.click();
  }, [onProjectReady]);

  // ドラッグ&ドロップ（ZIPファイル）
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    if (!isBrowser) return;
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith(".zip")) {
      setError("ZIPファイルのみインポートできます");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const { importProjectFromZip } = await import("../../services/zipService.js");
      const project = await importProjectFromZip(file);
      await storage.openProject(project.id);
      setLoading(false);
      onProjectReady(project.id);
    } catch (err) {
      setError("インポートに失敗: " + err.message);
      setLoading(false);
    }
  }, [onProjectReady]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // プロジェクト削除確認ダイアログを開く（ブラウザ版のみ）
  const handleDeleteProject = useCallback((e, projectPath) => {
    e.stopPropagation();
    setDeleteTarget(projectPath);
  }, []);

  // プロジェクト削除実行
  const confirmDeleteProject = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const adapter = (await import("../../services/browserAdapter.js")).browserAdapter;
      await adapter.deleteProject(deleteTarget);
      setRecentProjects((prev) => prev.filter((p) => p.path !== deleteTarget));
      // ストレージ使用量を再取得
      if (navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate();
        setStorageInfo(estimate);
      }
    } catch (err) {
      setError("削除に失敗: " + err.message);
    }
    setDeleteTarget(null);
  }, [deleteTarget]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography>読み込み中...</Typography>
      </Box>
    );
  }

  return (
    <Box
      onDrop={isBrowser ? handleDrop : undefined}
      onDragOver={isBrowser ? handleDragOver : undefined}
      sx={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100vh", width: "100vw", bgcolor: "background.default"
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
        Tojinovel {isBrowser && <Typography component="span" variant="h6" sx={{ color: "text.secondary" }}>Web Edition</Typography>}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: "text.secondary", mb: 3 }}>
        プロジェクトを選択してください
      </Typography>

      {/* ブラウザ版: データ永続性の警告 */}
      {isBrowser && (
        <Alert severity="warning" icon={<Warning />} sx={{ width: "100%", maxWidth: 600, mb: 2 }}>
          ブラウザ版ではデータはブラウザ内に保存されます。キャッシュクリアでデータが消える場合があります。
          こまめにZIPエクスポートでバックアップしてください。
        </Alert>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      <Card sx={{ width: "100%", maxWidth: 600, mb: 2 }}>
        <CardContent>
          {/* アクションボタン */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {/* Wails版のみ: フォルダ選択ボタン */}
            {!isBrowser && (
              <Button
                variant="contained"
                startIcon={<FolderOpen />}
                onClick={handleSelectFolder}
                fullWidth
              >
                フォルダを選択
              </Button>
            )}
            <Button
              variant={isBrowser ? "contained" : "outlined"}
              startIcon={<Add />}
              onClick={() => {
                setNewProjectName("");
                setNewProjectParent("");
                setNewDialogOpen(true);
              }}
              fullWidth
            >
              新規作成
            </Button>
            {/* ブラウザ版: ZIPインポートボタン */}
            {isBrowser && (
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={handleImportZip}
                fullWidth
              >
                ZIPインポート
              </Button>
            )}
          </Box>

          {/* 最近のプロジェクト */}
          <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
            {isBrowser ? "プロジェクト一覧" : "最近のプロジェクト"}
          </Typography>
          {recentProjects.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.disabled", textAlign: "center", py: 2 }}>
              まだプロジェクトがありません
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 400, overflowY: "auto" }}>
              {recentProjects.map((project) => (
                <ListItem key={project.path} disablePadding
                  secondaryAction={
                    isBrowser && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="ZIPエクスポート">
                          <IconButton size="small"
                            onClick={(e) => handleExportProject(e, project)}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="プロジェクトを削除">
                          <IconButton edge="end" size="small"
                            onClick={(e) => handleDeleteProject(e, project.path)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )
                  }
                >
                  <CardActionArea
                    onClick={() => handleOpenProject(project.path)}
                    sx={{ px: 1, py: 0.5, borderRadius: 1 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Folder />
                      </ListItemIcon>
                      <ListItemText
                        primary={project.name}
                        secondary={isBrowser ? project.lastModified : project.path}
                        secondaryTypographyProps={{ noWrap: true, fontSize: "0.75rem" }}
                      />
                    </Box>
                  </CardActionArea>
                </ListItem>
              ))}
            </List>
          )}

          {/* ブラウザ版: ドラッグ&ドロップヒント */}
          {isBrowser && (
            <Typography variant="caption" sx={{ color: "text.disabled", textAlign: "center", display: "block", mt: 1 }}>
              ZIPファイルをドラッグ&ドロップしてインポートすることもできます
            </Typography>
          )}

          {/* ブラウザ版: ストレージ使用量 */}
          {isBrowser && storageInfo && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                ストレージ使用量: {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((storageInfo.usage / storageInfo.quota) * 100, 100)}
                color={storageInfo.usage / storageInfo.quota > 0.8 ? "warning" : "primary"}
                sx={{ mt: 0.5 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 新規作成ダイアログ */}
      <Dialog open={newDialogOpen} onClose={() => setNewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新規プロジェクト作成</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="プロジェクト名"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isBrowser && newProjectName.trim()) {
                handleCreateProject();
              }
            }}
          />
          {/* Wails版のみ: 作成場所の選択 */}
          {!isBrowser && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                label="作成場所"
                fullWidth
                value={newProjectParent}
                InputProps={{ readOnly: true }}
                placeholder="フォルダを選択..."
              />
              <Button variant="outlined" onClick={handleSelectParent} sx={{ whiteSpace: "nowrap" }}>
                参照
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDialogOpen(false)}>キャンセル</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!newProjectName.trim() || (!isBrowser && !newProjectParent)}
          >
            作成
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>プロジェクト削除</DialogTitle>
        <DialogContent>
          <Typography>このプロジェクトを削除しますか？この操作は取り消せません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>キャンセル</Button>
          <Button onClick={confirmDeleteProject} variant="contained" color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// バイト数を読みやすい形式に変換
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
