import { StrictMode, useState, useCallback, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EditorApp from './EditorApp.jsx'
import GameApp from './GameApp.jsx'
import ProjectSelector from './components/editor/ProjectSelector.jsx'
import { setAdapter } from './services/storageService'
import { wailsAdapter } from './services/wailsAdapter'
import { httpAdapter } from './services/httpAdapter'

// ビルドモード判定
const isBrowserMode = import.meta.env.VITE_BUILD_MODE === 'browser';

// Wails/HTTP版は同期的にアダプタを設定（従来通り）
if (!isBrowserMode) {
  const isWails = !!window.go;
  setAdapter(isWails ? wailsAdapter : httpAdapter);
}

// URLパラメータでデバッグモード判定（?debug）
const params = new URLSearchParams(window.location.search);
const isDebug = params.has('debug');

// ルートアプリ: プロジェクト選択フローを挟む
// eslint-disable-next-line react-refresh/only-export-components
function RootApp() {
  // ブラウザ版は非同期初期化が必要
  const [adapterReady, setAdapterReady] = useState(!isBrowserMode);
  const [initError, setInitError] = useState(null);
  // セッション継続中（デバッグから戻った場合など）はプロジェクト選択不要
  const [projectReady, setProjectReady] = useState(!!sessionStorage.getItem("sessionRunning"));

  // ブラウザ版: 非同期でアダプタ初期化
  useEffect(() => {
    if (!isBrowserMode) return;
    (async () => {
      try {
        const { browserAdapter } = await import('./services/browserAdapter.js');
        await browserAdapter.init();
        setAdapter(browserAdapter);
        setAdapterReady(true);
      } catch (err) {
        console.error("ブラウザ版初期化エラー:", err);
        setInitError(err.message || "初期化に失敗しました");
      }
    })();
  }, []);

  const handleProjectReady = useCallback((projectPath) => {
    // プロジェクト切り替え時はセッションをリセット（前プロジェクトの状態混入防止）
    sessionStorage.clear();
    // IndexedDBキーのプロジェクト別分離のためパスを保存
    if (projectPath) {
      sessionStorage.setItem("currentProjectPath", projectPath);
    }
    setProjectReady(true);
  }, []);

  // アダプタ初期化エラー
  if (initError) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", color: "#c00", gap: 8 }}>
        <div style={{ fontSize: 18 }}>初期化に失敗しました</div>
        <div style={{ fontSize: 14, color: "#666" }}>{initError}</div>
        <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
          プライベートブラウジングモードではIndexedDBが使用できない場合があります。
        </div>
      </div>
    );
  }

  // アダプタ初期化中
  if (!adapterReady) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#666" }}>
        読み込み中...
      </div>
    );
  }

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
