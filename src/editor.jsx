import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './EditorApp.jsx'
import { setAdapter } from './services/storageService'
import { httpAdapter } from './services/httpAdapter'
import { wailsAdapter } from './services/wailsAdapter'

// Wails環境かどうかを判定（Wails v2はwindow.goにバインディングを公開する）
const isWails = !!window.go;
setAdapter(isWails ? wailsAdapter : httpAdapter);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
