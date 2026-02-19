import { StrictMode, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EditorApp from './EditorApp.jsx'
import GameApp from './GameApp.jsx'
import ProjectSelector from './components/editor/ProjectSelector.jsx'
import { setAdapter } from './services/storageService'
import { wailsAdapter } from './services/wailsAdapter'
import { httpAdapter } from './services/httpAdapter'

// Wails環境（window.go が存在）かどうかで Adapter を切り替える
const isWails = !!window.go;
setAdapter(isWails ? wailsAdapter : httpAdapter);

// URLパラメータでデバッグモード判定（?debug）
const params = new URLSearchParams(window.location.search);
const isDebug = params.has('debug');

// ルートアプリ: プロジェクト選択フローを挟む
// eslint-disable-next-line react-refresh/only-export-components
function RootApp() {
  // セッション継続中（デバッグから戻った場合など）はプロジェクト選択不要
  const [projectReady, setProjectReady] = useState(!!sessionStorage.getItem("sessionRunning"));

  const handleProjectReady = useCallback((projectPath) => {
    // プロジェクト切り替え時はセッションをリセット（前プロジェクトの状態混入防止）
    sessionStorage.clear();
    // IndexedDBキーのプロジェクト別分離のためパスを保存
    if (projectPath) {
      sessionStorage.setItem("currentProjectPath", projectPath);
    }
    setProjectReady(true);
  }, []);

  // デバッグモード（エディタに戻るボタン付き）
  if (isDebug) {
    return (
      <>
        <GameApp debug />
        <button
          onClick={() => { window.location.search = ""; }}
          style={{
            position: "fixed", top: 8, right: 8, zIndex: 9999,
            padding: "4px 12px", cursor: "pointer",
            background: "rgba(0,0,0,0.7)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4,
            fontSize: 12, opacity: 0.7,
          }}
          onMouseEnter={(e) => { e.target.style.opacity = 1; }}
          onMouseLeave={(e) => { e.target.style.opacity = 0.7; }}
        >
          エディタに戻る
        </button>
      </>
    );
  }

  // プロジェクト未選択ならProjectSelector表示
  if (!projectReady) {
    return <ProjectSelector onProjectReady={handleProjectReady} />;
  }

  return <EditorApp />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
