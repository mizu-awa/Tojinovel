import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './GameApp.jsx'
import { setAdapter } from './services/storageService'
import { httpAdapter } from './services/httpAdapter'

// 書き出しプレイヤーはHTTPアダプター（fetch）でゲームデータを読み込む
setAdapter(httpAdapter);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
