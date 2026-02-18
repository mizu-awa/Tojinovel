import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './EditorApp.jsx'
import { setAdapter } from './services/storageService'
import { httpAdapter } from './services/httpAdapter'

// Adapter初期化（Wails環境判定は将来wailsAdapter導入時に追加）
setAdapter(httpAdapter);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
