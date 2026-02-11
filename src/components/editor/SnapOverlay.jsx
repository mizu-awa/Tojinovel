import { memo } from "react";

// ドラッグ/リサイズ中にスナップが発生した時のガイドラインを描画するオーバーレイ
// guideLines: [{type: 'v'|'h', pos: number}]
// screenSize: [width, height]
function SnapOverlay({ guideLines, screenSize }) {
  if (!guideLines || guideLines.length === 0) return null;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: screenSize[0],
        height: screenSize[1],
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {guideLines.map((line, i) =>
        line.type === "v" ? (
          <line
            key={i}
            x1={line.pos}
            y1={0}
            x2={line.pos}
            y2={screenSize[1]}
            stroke="magenta"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.8}
          />
        ) : (
          <line
            key={i}
            x1={0}
            y1={line.pos}
            x2={screenSize[0]}
            y2={line.pos}
            stroke="magenta"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.8}
          />
        )
      )}
    </svg>
  );
}

export default memo(SnapOverlay);
