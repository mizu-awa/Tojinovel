import { memo } from "react";
import Hotspots from "./Hotspots";

function ItemDrawer({
    item,
    itemDrawer,
    handleHotspotClick,
    handleItemBackClick,
    edit=false,
    hotspotIndex,
    stateIndex,
    onMouseDown,
    hotspotRefs,
    handleResizeStart,
    handleRotateStart,
    variables,
    setSelectedSubItem,
    setSelectedThirdItem
}){
    if(!item) return null;

    return(
      <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1501,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
      >

        <div
          style={{
            ...itemDrawer.backStyle,
            width: "100%",
            height: "100%",
            boxSizing: "border-box"
          }}
          onClick={handleItemBackClick}
        />

        {/* ホットスポット選択解除 1 */}
          {edit && <div
            onClick={() => {
              setSelectedSubItem(null);
              setSelectedThirdItem(null);
            }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0
            }}
          />}

        <div
          style={{
            ...itemDrawer.style,
            position: "absolute",
            width: itemDrawer.size[0],
            height: itemDrawer.size[1],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "content-box",
            overflow: edit ? "visible" : "hidden"
          }}
        >
          <img
              src={item.image}
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
          />
          {/* ホットスポット選択解除 2 */}
          {edit && <div
            onClick={() => {
              setSelectedSubItem(null);
              setSelectedThirdItem(null);
            }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0
            }}
          />}

          {/* ホットスポット */}
          <Hotspots
            type="item"
            hotspots={item.hotspots}
            currentSceneName={item.name}
            handleHotspotClick={handleHotspotClick}
            edit={edit}
            hotspotIndex={hotspotIndex}
            stateIndex={stateIndex}
            onMouseDown={onMouseDown}
            hotspotRefs={hotspotRefs}
            handleResizeStart={handleResizeStart}
            handleRotateStart={handleRotateStart}
            variables={variables}
          />
        </div>
      </div>
    )
}

export default memo(ItemDrawer);