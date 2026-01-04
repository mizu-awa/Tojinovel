import { useRef } from "react";

export default function useResizeWindow({
    gameData
}){
    // ref-------------------------------------------------------------------------------------------
    const ref = useRef();
    const observerRef = useRef(null);

    const boxRef = (node) => {
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
    
        if (node) {
          const observer = new ResizeObserver(() => {
            const container = ref.current;
            if (!container) return;
    
            const { clientWidth, clientHeight } = node;
    
            const baseWidth = gameData.game.screenSize[0];
            const baseHeight = gameData.game.screenSize[1];
    
            const scale = Math.min(Math.min(clientWidth / baseWidth, clientHeight / baseHeight), 1);
            container.style.transform = `scale(${scale * 0.95})`;
            container.style.transformOrigin = "center center";
          });
    
          observer.observe(node);
          observerRef.current = observer;
        }
      };

    return ({
        ref,
        boxRef
    })
}