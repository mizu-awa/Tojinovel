import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EditorApp from './EditorApp.jsx'
import GameApp from './GameApp.jsx'
import { setAdapter } from './services/storageService'
import { httpAdapter } from './services/httpAdapter'
import { wailsAdapter } from './services/wailsAdapter'

// Wails環境かどうかを判定（Wails v2はwindow.goにバインディングを公開する）
const isWails = !!window.go;
setAdapter(isWails ? wailsAdapter : httpAdapter);

// URLパラメータでデバッグモード判定（?debug）
const params = new URLSearchParams(window.location.search);
const isDebug = params.has('debug');
const App = isDebug ? () => <GameApp debug /> : EditorApp;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
