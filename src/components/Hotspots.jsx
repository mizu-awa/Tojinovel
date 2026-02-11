import { RotateRight } from "@mui/icons-material";
import { memo, useState, useRef, useEffect } from "react";

const editBorderStyle = {
  position: "absolute",
  inset: 0,
  border: "1px dotted red",
  boxSizing: "border-box",
}

const scaleHandleBase = {
  border: "gray 1px solid",
  backgroundColor: "white",
  width: "10px",
  height: "10px",
  position: "absolute",
  transform: "translate(-50%, -50%)",
  borderRadius: "5px"
}

function expandVariables(text, variables) {
  // 変数名をキーにしたMapを作ると高速
  const varMap = new Map(variables.map(v => [v.name, v.value]));

  return text.replace(/\[([^\]]+)\]/g, (_, varName) => {
    // varMapに存在すれば展開、なければそのまま
    return varMap.has(varName) ? String(varMap.get(varName)) : `[${varName}]`;
  });
}

function Hotspots({
  type,
  edit = false,
  hotspotIndex = null,
  stateIndex,
  hotspots,
  variables,
  handleHotspotClick,
  onMouseDown,
  hotspotRefs = null,
  handleResizeStart,
  handleRotateStart,
  onTextChange
}) {
  // インラインテキスト編集用の状態
  const [editingKey, setEditingKey] = useState(null);
  const [editingText, setEditingText] = useState("");
  const inputRef = useRef(null);
  const committedRef = useRef(false); // Enter/Escapeで確定済みフラグ（onBlurの二重呼び出し防止）

  // 編集開始時にinputにフォーカス
  useEffect(() => {
    if (editingKey && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingKey]);

  if (!hotspots) return null;

  return (
    <>
      {hotspots.map((hs, index) => {
        // 表示状態を取得
        const hssIndex = edit
          ? (!(stateIndex == null || stateIndex !== stateIndex) && hotspotIndex === index)// 選択中のホットスポットかつ、ステート選択中
            ? stateIndex
            : hs.states.findIndex((s) => s.name === hs.state)
          : hs.states.findIndex((s) => s.name === hs.state);
        const hss = hs.states[hssIndex];

        if (!hss || !hss.visibility) return null;

        const { x, y, width, height } = hss;

        const style = {
          position: "absolute",
          left: x,
          top: y,
          width,
          height,
          zIndex: 500 + hss.zIndex,
          display: "flex",
          alignItems: hss.style.textVAlign,
          justifyContent: hss.style.textAlign,
          padding: hss.style.textPadding,
          boxSizing: "border-box",
          color: hss.style.color ?? "#000",
          fontSize: hss.style.fontSize ?? "0.8rem",
          fontFamily: hss.style.fontFamily ?? "inherit",
          boxShadow: hss.style.shadowColor
            ? `0 4px 12px ${hss.style.shadowColor}`
            : undefined,
          backgroundImage: hss.background ? `url(${hss.background})` : undefined,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          cursor: edit ? "move" : "pointer",
          transform: `rotate(${hss.style.rotate}deg)`,
          transformOrigin: "center center",
          ...hss.style,
        };

        return (
          <div
            key={type + hs.name + hss.name + index}
            style={style}
            onClick={(e) => {
              e.stopPropagation();
              handleHotspotClick(hss)
            }}
            onDoubleClick={edit ? (e) => {
              e.stopPropagation();
              const key = `${index}-${hssIndex}`;
              committedRef.current = false;
              setEditingKey(key);
              setEditingText(hss.text || "");
            } : undefined}
            className={(hss.hover === "none" || hss.hover === "hoverSh" || hss.hover === "hoverSp") ? null : hss.hover}
            ref={(el) => {
              if (el && hotspotRefs) hotspotRefs.current[`${index}-${hssIndex}`] = el;
            }}
            onMouseDown={ edit ? (e) => { if (e.detail < 2) onMouseDown(e); } : () => {} }
            data-hindex={index}
            data-sindex={hssIndex}
          >
            {edit && editingKey === `${index}-${hssIndex}` ? (
              <input
                ref={inputRef}
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => {
                  if (!committedRef.current) {
                    if (onTextChange && editingText !== (hss.text || "")) onTextChange(index, hssIndex, editingText);
                  }
                  setEditingKey(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    committedRef.current = true;
                    if (onTextChange && editingText !== (hss.text || "")) onTextChange(index, hssIndex, editingText);
                    setEditingKey(null);
                  } else if (e.key === "Escape") {
                    committedRef.current = true;
                    setEditingKey(null);
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "1px solid #1976d2",
                  outline: "none",
                  background: "rgba(255,255,255,0.9)",
                  color: hss.style.color ?? "#000",
                  fontSize: hss.style.fontSize ?? "0.8rem",
                  fontFamily: hss.style.fontFamily ?? "inherit",
                  fontWeight: hss.style.fontWeight ?? 400,
                  textAlign: hss.style.textAlign ?? "left",
                  padding: hss.style.textPadding ?? 0,
                  boxSizing: "border-box",
                }}
              />
            ) : (
              hss.text &&
                <span style={{textAlign: "center" }}>{expandVariables(hss.text, variables)}</span>
            )}
            {edit && (
              <div
                style={editBorderStyle}
              />
            )}
            {edit && (hotspotIndex === index) && (
              <>
                <div
                  style={{
                    ...scaleHandleBase,
                    top: 0,
                    left: 0,
                    cursor: "nw-resize"
                  }}
                  data-corner="tl"
                  onMouseDown={handleResizeStart}
                />

                <div
                  style={{
                    ...scaleHandleBase,
                    top: 0,
                    left: "50%",
                    cursor: "n-resize"
                  }}
                  data-corner="t"
                  onMouseDown={handleResizeStart}
                />

                <div
                  style={{
                    ...scaleHandleBase,
                    top: 0,
                    left: "100%",
                    cursor: "ne-resize"
                  }}
                  data-corner="tr"
                  onMouseDown={handleResizeStart}
                />

                <div
                  style={{
                    ...scaleHandleBase,
                    top: "50%",
                    left: "100%",
                    cursor: "e-resize"
                  }}
                  data-corner="r"
                  onMouseDown={handleResizeStart}
                />

                <div
                  style={{
                    ...scaleHandleBase,
                    top: "100%",
                    left: "100%",
                    cursor: "se-resize"
                  }}
                  data-corner="br"
                  onMouseDown={handleResizeStart}
                />

                <div
                  style={{
                    ...scaleHandleBase,
                    top: "100%",
                    left: "50%",
                    cursor: "s-resize"
                  }}
                  data-corner="b"
                  onMouseDown={handleResizeStart}
                />

                <div
                  style={{
                    ...scaleHandleBase,
                    top: "100%",
                    left: 0,
                    cursor: "sw-resize"
                  }}
                  data-corner="bl"
                  onMouseDown={handleResizeStart}
                />

                <div
                  style={{
                    ...scaleHandleBase,
                    top: "50%",
                    left: 0,
                    cursor: "w-resize"
                  }}
                  data-corner="l"
                  onMouseDown={handleResizeStart}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "50%",
                    transform: "translate(-50%, -200%)"
                  }}
                  onMouseDown={handleRotateStart}
                >
                  <RotateRight
                    size={20}
                    sx={{
                      filter: "drop-shadow(0 0 2px white)", // 輪郭
                    }}
                  />
                </div>
              </>
            )}

            {hss.hover === "hoverSh" &&
              <div
                className="hoverSh"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0
                }}
              />}
            {hss.hover === "hoverSp" &&
              <div
                className="hoverSp"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0
                }}
              />}
          </div>
        );
      })}
    </>
  );
}

export default memo(Hotspots);
