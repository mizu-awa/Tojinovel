import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DebugOverlay from "./DebugOverlay.jsx";

// ハンドルスタイルはシステムテーマに応じて切り替え
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const debugHandleStyle = {
  backgroundColor: isDark ? "#333" : "#ddd",
  width: "1px",
  cursor: "col-resize",
};

export default function DebugLayout({ children, debugProps }) {
  return (
    <PanelGroup direction="horizontal" style={{ width: "100vw", height: "100vh" }}>
      <Panel defaultSize={65} minSize={40}>
        {children}
      </Panel>
      <PanelResizeHandle style={debugHandleStyle} />
      <Panel defaultSize={35} minSize={20}>
        <DebugOverlay {...debugProps} />
      </Panel>
    </PanelGroup>
  );
}
