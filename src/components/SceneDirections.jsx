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
                  {config.useDefaultArrow && <ChevronUp size={config.size} />}
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
                  {config.useDefaultArrow && <ChevronRight size={config.size} />}
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
                  {config.useDefaultArrow && <ChevronDown size={config.size} />}
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
                  {config.useDefaultArrow && <ChevronLeft size={config.size} />}
                </div>
              }
        </>
    )
}

export default memo(SceneDirections);