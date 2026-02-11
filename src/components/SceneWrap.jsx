import { memo } from "react";

function SceneWrap({
    children,
    screenSize,
    itemBoxSize,
    itemBoxPosition,
    background,
    edit=false
}){
    const dir = (itemBoxPosition === "right" || itemBoxPosition === "left") ? "row"
                : (itemBoxPosition === "top" || itemBoxPosition === "bottom") ? "column"
                : "row";

    return(
        <div
            style={{
                position: "relative",
                width: dir === "row" ? screenSize[0] - itemBoxSize : "100%",
                minWidth: dir === "row" ? screenSize[0] - itemBoxSize : "100%",
                height: dir === "row" ? "100%" : screenSize[1] - itemBoxSize,
                minHeight: dir === "row" ? "100%" : screenSize[1] - itemBoxSize,
                overflow: edit ? "visible" : "hidden"
            }}
        >
            {background && <img
                src={background}
                draggable={false}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                }}
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "./system/transparent.png";
                }}
            />}
            {children}
        </div>
    )
}

export default memo(SceneWrap);