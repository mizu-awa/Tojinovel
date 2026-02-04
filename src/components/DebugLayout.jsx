import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { handleStyle } from "./editor/handleStyle.js";
import DebugOverlay from "./DebugOverlay.jsx";

export default function DebugLayout({ children, debugProps }) {
  return (
    <PanelGroup direction="horizontal" style={{ width: "100vw", height: "100vh" }}>
      <Panel defaultSize={65} minSize={40}>
        {children}
      </Panel>
      <PanelResizeHandle style={handleStyle} />
      <Panel defaultSize={35} minSize={20}>
        <DebugOverlay {...debugProps} />
      </Panel>
    </PanelGroup>
  );
}
