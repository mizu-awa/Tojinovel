import { StrictMode, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EditorApp from './EditorApp.jsx'
import GameApp from './GameApp.jsx'
import ProjectSelector from './components/editor/ProjectSelector.jsx'
import { setAdapter } from './services/storageService'
import { httpAdapter } from './services/httpAdapter'
import { wailsAdapter } from './services/wailsAdapter'

// Wails環境かどうかを判定（Wails v2はwindow.goにバインディングを公開する）
const isWails = !!window.go;
setAdapter(isWails ? wailsAdapter : httpAdapter);

// URLパラメータでデバッグモード判定（?debug）
const params = new URLSearchParams(window.location.search);
const isDebug = params.has('debug');

// ルートアプリ: Wails環境ではプロジェクト選択フローを挟む
// eslint-disable-next-line react-refresh/only-export-components
function RootApp() {
  // HTTP環境ではプロジェクト選択不要（従来通り直接エディタ表示）
  const [projectReady, setProjectReady] = useState(!isWails);

  const handleProjectReady = useCallback(() => {
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

  // Wails環境: プロジェクト未選択ならProjectSelector表示
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
