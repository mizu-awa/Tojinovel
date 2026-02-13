import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { memo } from "react";

function SceneDirections({
    directions,
    config,
    handleDirectionClick
}){
    return(
        <>
            {directions.top.target &&
                <div
                  style={{
                    ...config.style,
                    position: "absolute",
                    top: "0%",
                    left: config.size,
                    width: `calc(100% - ${config.size}px - ${config.size}px)`,
                    height: config.size,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1500
                  }}
                  className={config.hover}
                  onClick={() => handleDirectionClick(directions.top)}
                >
                  {config.images?.top ? (
                    <img
                      src={config.images.top}
                      alt="上へ"
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
                  ) : config.useDefaultArrow ? (
                    <ChevronUp size={config.size} />
                  ) : null}
                </div>
              }
        
              {directions.right.target &&
                <div
                  style={{
                    ...config.style,
                    position: "absolute",
                    top: config.size,
                    right: "0%",
                    width: config.size,
                    height: `calc(100% - ${config.size}px - ${config.size}px)`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1500
                  }}
                  className={config.hover}
                  onClick={() => handleDirectionClick(directions.right)}
                >
                  {config.images?.right ? (
                    <img
                      src={config.images.right}
                      alt="右へ"
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
                  ) : config.useDefaultArrow ? (
                    <ChevronRight size={config.size} />
                  ) : null}
                </div>
              }
        
              {directions.bottom.target &&
                <div
                  style={{
                    ...config.style,
                    position: "absolute",
                    bottom: "0%",
                    left: config.size,
                    width: `calc(100% - ${config.size}px - ${config.size}px)`,
                    height: config.size,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1500
                  }}
                  className={config.hover}
                  onClick={() => handleDirectionClick(directions.bottom)}
                >
                  {config.images?.bottom ? (
                    <img
                      src={config.images.bottom}
                      alt="下へ"
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
                  ) : config.useDefaultArrow ? (
                    <ChevronDown size={config.size} />
                  ) : null}
                </div>
              }
        
              {directions.left.target &&
                <div
                  style={{
                    ...config.style,
                    position: "absolute",
                    top: config.size,
                    left: "0%",
                    width: config.size,
                    height: `calc(100% - ${config.size}px - ${config.size}px)`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1500
                  }}
                  className={config.hover}
                  onClick={() => handleDirectionClick(directions.left)}
                >
                  {config.images?.left ? (
                    <img
                      src={config.images.left}
                      alt="左へ"
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
                  ) : config.useDefaultArrow ? (
                    <ChevronLeft size={config.size} />
                  ) : null}
                </div>
              }
        </>
    )
}

export default memo(SceneDirections);