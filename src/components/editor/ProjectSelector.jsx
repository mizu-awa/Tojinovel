import { useCallback, useEffect, useState } from "react";
import {
  Box, Button, Card, CardActionArea, CardContent,
  Dialog, DialogActions, DialogContent, DialogTitle,
  List, ListItem, ListItemIcon, ListItemText,
  TextField, Typography
} from "@mui/material";
import { Add, FolderOpen, Folder } from "@mui/icons-material";
import { storage } from "../../services/storageService";

// プロジェクト選択画面
export default function ProjectSelector({ onProjectReady }) {
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 新規作成ダイアログ
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectParent, setNewProjectParent] = useState("");

  // 初期ロード
  useEffect(() => {
    (async () => {
      try {
        const projects = await storage.listProjects();
        setRecentProjects(projects || []);
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

  // フォルダ選択ダイアログ
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

  // 新規作成ダイアログ: 親フォルダ選択
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
    if (!newProjectName.trim() || !newProjectParent) return;
    try {
      setError(null);
      const createdPath = await storage.createProject(newProjectName.trim(), newProjectParent);
      setNewDialogOpen(false);
      onProjectReady(createdPath);
    } catch (e) {
      setError("プロジェクト作成に失敗: " + e.message);
    }
  }, [newProjectName, newProjectParent, onProjectReady]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography>読み込み中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100vh", bgcolor: "background.default", p: 3
    }}>
      <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
        Tojinovel
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: "text.secondary", mb: 3 }}>
        プロジェクトを選択してください
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      <Card sx={{ width: "100%", maxWidth: 600, mb: 2 }}>
        <CardContent>
          {/* アクションボタン */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<FolderOpen />}
              onClick={handleSelectFolder}
              fullWidth
            >
              フォルダを選択
            </Button>
            <Button
              variant="outlined"
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
          </Box>

          {/* 最近のプロジェクト */}
          <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
            最近のプロジェクト
          </Typography>
          {recentProjects.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.disabled", textAlign: "center", py: 2 }}>
              まだプロジェクトがありません
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 400, overflowY: "auto" }}>
              {recentProjects.map((project) => (
                <ListItem key={project.path} disablePadding>
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
                        secondary={project.path}
                        secondaryTypographyProps={{ noWrap: true, fontSize: "0.75rem" }}
                      />
                    </Box>
                  </CardActionArea>
                </ListItem>
              ))}
            </List>
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
          />
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDialogOpen(false)}>キャンセル</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!newProjectName.trim() || !newProjectParent}
          >
            作成
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
