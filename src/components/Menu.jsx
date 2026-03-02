import { memo } from "react"

function Menu({
    menu,
    save,
    load,
    config
}){
    if(menu.position === "none") return null;
    
    // textOutlineColorからtext-shadow（16方向、2px固定）を生成
    const { textOutlineColor, ...restStyle } = menu.style;
    const c = textOutlineColor;
    const textShadow = c && c !== "rgba(0, 0, 0, 0)"
        ? [
            `0 -2px 0 ${c}`, `0 2px 0 ${c}`, `-2px 0 0 ${c}`, `2px 0 0 ${c}`,
            `-1px -2px 0 ${c}`, `1px -2px 0 ${c}`, `-1px 2px 0 ${c}`, `1px 2px 0 ${c}`,
            `-2px -1px 0 ${c}`, `2px -1px 0 ${c}`, `-2px 1px 0 ${c}`, `2px 1px 0 ${c}`,
            `-1px -1px 0 ${c}`, `1px -1px 0 ${c}`, `-1px 1px 0 ${c}`, `1px 1px 0 ${c}`,
        ].join(", ")
        : undefined;

    return(
        <div
            style={{
                ...restStyle,
                textShadow,
                zIndex: 3000,
                position: "absolute",
                top: menu.position.includes("top") ? 0 : "auto",
                bottom: menu.position.includes("top") ? "auto" : 0,
                left: menu.position.includes("left") ? 0 : "auto",
                right: menu.position.includes("left") ? "auto" : 0,
                display: "flex",
                margin: "0.25em 1em"
            }}
        >
            {menu.visibleSave &&
            <div
                className={menu.hover}
                style={{position: "relative"}}
                onClick={save}
            >
                {menu.saveText}
            </div>}
            {menu.visibleLoad &&
            <div
                className={menu.hover}
                style={{position: "relative"}}
                onClick={load}
            >
                {menu.loadText}
            </div>
            }
            {menu.visibleConfig &&
            <div
                className={menu.hover}
                style={{position: "relative"}}
                onClick={config}
            >
                {menu.configText}
            </div>
            }
        </div>
    )
}

export default memo(Menu);