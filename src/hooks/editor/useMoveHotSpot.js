import { useCallback } from "react";

export default function useMoveHotspot({
  gameDataRef,
  ref,
  hotspotRefs,
  mainTab,
  selectedItem,
  setGameData,
  setSelectedSubItem,
  setSelectedThirdItem,
  debouncedDoAction
}){
    const onDragStart = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        debouncedDoAction(true);
    
        const startX = e.clientX;
        const startY = e.clientY;
    
        const hIndex = Number(e.currentTarget.dataset.hindex);
        const sIndex = Number(e.currentTarget.dataset.sindex); 
    
        // ✅ 最新データをrefから取得
        const current = gameDataRef.current;
        const area =
          mainTab === "scenes"
            ? current.scenes[selectedItem]?.hotspots[hIndex]?.states[sIndex]?.area
            : mainTab === "items"
            ? current.items[selectedItem]?.hotspots[hIndex]?.states[sIndex]?.area
            : null;
    
        if (!area) return;
    
        const startArea = [...area]; // コピーして固定
    
        // 拡大率を取得しておく
        const match = ref.current.style.transform.match(/scale\(([^)]+)\)/);
        const scale = ( match ? parseFloat(match[1]) : 1 ); // scaleがなければ1を返す
    
    
        // ✅ hotspot要素への参照（ドラッグ中、これを直接動かす）
        const hotspotEl = hotspotRefs.current?.[`${hIndex}-${sIndex}`];
        if (!hotspotEl) return;
    
        const onMouseMove = (e) => {
          const dx = (e.clientX - startX) / scale;
          const dy = (e.clientY - startY) / scale;
    
          // 即時描画
          const newX1 = startArea[0] + dx;
          const newY1 = startArea[1] + dy;
          const newX2 = startArea[2] + dx;
          const newY2 = startArea[3] + dy;
    
          hotspotEl.style.left = `${newX1}px`;
          hotspotEl.style.top = `${newY1}px`;
    
          // refデータを最新化しておく（再レンダーなし）
          if (mainTab === "scenes") {
            current.scenes[selectedItem].hotspots[hIndex].states[sIndex].area = [
              Math.floor(newX1), Math.floor(newY1), Math.floor(newX2), Math.floor(newY2),
            ];
          } else if (mainTab === "items") {
            current.items[selectedItem].hotspots[hIndex].states[sIndex].area = [
              Math.floor(newX1), Math.floor(newY1), Math.floor(newX2), Math.floor(newY2),
            ];
          }
        };
    
        const onMouseUp = () => {
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
    
          // ✅ 確定時のみ state 更新
          setGameData(structuredClone(gameDataRef.current));
          setSelectedSubItem(hIndex); // ホットスポットを選択状態に
          setSelectedThirdItem(sIndex); // ステートも選択状態に
        };
    
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      }, [mainTab, selectedItem, setGameData, setSelectedSubItem, setSelectedThirdItem]);
    
    
    const handleResizeStart = (e) => {
      e.stopPropagation();

      debouncedDoAction(true);
    
      const hIndex = Number(e.currentTarget.parentElement.dataset.hindex);
      const sIndex = Number(e.currentTarget.parentElement.dataset.sindex); 
    
      // ✅ 最新データをrefから取得
      const current = gameDataRef.current;
      const area =
        mainTab === "scenes"
          ? current.scenes[selectedItem]?.hotspots[hIndex]?.states[sIndex]?.area
          : mainTab === "items"
          ? current.items[selectedItem]?.hotspots[hIndex]?.states[sIndex]?.area
          : null;
    
      if (!area) return;
    
      // ✅ hotspot要素への参照（ドラッグ中、これを直接動かす）
      const hotspotEl = hotspotRefs.current?.[`${hIndex}-${sIndex}`];
      if (!hotspotEl) return;
    
      const startArea = [...area]; // コピーして固定
    
      const rotate =
        mainTab === "scenes"
          ? current.scenes[selectedItem]?.hotspots[hIndex]?.states[sIndex]?.style.rotate || 0
          : mainTab === "items"
          ? current.items[selectedItem]?.hotspots[hIndex]?.states[sIndex]?.style.rotate || 0
          : 0;
      const rad = rotate / 180 * Math.PI;
    
      // 拡大率を取得しておく
      const match = ref.current.style.transform.match(/scale\(([^)]+)\)/);
      const scale = ( match ? parseFloat(match[1]) : 1 ) ; // scaleがなければ1を返す
    
      const corner = e.target.dataset.corner;
      const startX = e.clientX;
      const startY = e.clientY;
    
      const startWidth = startArea[2] - startArea[0];
      const startHeight = startArea[3] - startArea[1];
      const startCx = (startArea[0] + startArea[2]) / 2;
      const startCy = (startArea[1] + startArea[3]) / 2;
    
      const onMouseMove = (e) => {
        const dx = (e.clientX - startX) / scale;
        const dy = (e.clientY - startY) / scale;
    
        // --- 回転角を逆方向に適用して、ローカル座標系での変化に変換する ---
        const localDx = dx * Math.cos(-rad) - dy * Math.sin(-rad);
        const localDy = dx * Math.sin(-rad) + dy * Math.cos(-rad);
    
        let newWidth = startWidth;
        let newHeight = startHeight;
        let offsetX = 0;
        let offsetY = 0;
    
        // corner: "lt", "rb" など
        if (corner.includes("l")) {
          newWidth -= localDx;
          offsetX += localDx / 2; // 中心基準で補正
        }
        if (corner.includes("r")) {
          newWidth += localDx;
          offsetX += localDx / 2;
        }
        if (corner.includes("t")) {
          newHeight -= localDy;
          offsetY += localDy / 2;
        }
        if (corner.includes("b")) {
          newHeight += localDy;
          offsetY += localDy / 2;
        }
    
        // 新しい中心座標（ローカル補正 → グローバルに変換）
        const newCx = startCx + offsetX * Math.cos(rad) - offsetY * Math.sin(rad);
        const newCy = startCy + offsetX * Math.sin(rad) + offsetY * Math.cos(rad);
    
        // newRect = [x1, y1, x2, y2]
        const newRect = [
          newCx - newWidth / 2,
          newCy - newHeight / 2,
          newCx + newWidth / 2,
          newCy + newHeight / 2
        ];
    
        hotspotEl.style.left = `${newRect[0]}px`;
        hotspotEl.style.top = `${newRect[1]}px`;
        hotspotEl.style.width = `${newWidth}px`;
        hotspotEl.style.height = `${newHeight}px`;
    
        // refデータを最新化しておく（再レンダーなし）
        if (mainTab === "scenes") {
          current.scenes[selectedItem].hotspots[hIndex].states[sIndex].area = newRect.map(Math.floor);
        } else if (mainTab === "items") {
          current.items[selectedItem].hotspots[hIndex].states[sIndex].area = newRect.map(Math.floor);
        }
    
      }
    
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    
        // ✅ 確定時のみ state 更新
        setGameData(structuredClone(gameDataRef.current));
      };
    
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };
    
    const handleRotateStart = (e) => {
      e.stopPropagation();

      debouncedDoAction(true);
    
      const hIndex = Number(e.currentTarget.parentElement.dataset.hindex);
      const sIndex = Number(e.currentTarget.parentElement.dataset.sindex); 
    
      // ✅ 最新データをrefから取得
      const current = gameDataRef.current;
      const rotate =
        mainTab === "scenes"
          ? current.scenes[selectedItem]?.hotspots[hIndex]?.states[sIndex]?.style.rotate || 0
          : mainTab === "items"
          ? current.items[selectedItem]?.hotspots[hIndex]?.states[sIndex]?.style.rotate || 0
          : 0;
    
      // ✅ hotspot要素への参照（ドラッグ中、これを直接動かす）
      const hotspotEl = hotspotRefs.current?.[`${hIndex}-${sIndex}`];
      if (!hotspotEl) return;
    
      // ✅ ホットスポットの中心座標を取得
      const rect = hotspotEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
    
      // ✅ 回転開始時の角度
      const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    
      const onMouseMove = (e) => {
        // 現在の角度
        const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
        // 差分を求める
        const delta = currentAngle - startAngle;
        // 新しい角度
        const newRotate = ( rotate + delta ) % 360;
    
        hotspotEl.style.transform = `rotate(${newRotate}deg)`;/* TODO: rptate以外の設定項目がある場合は変更必要 */
    
        // refデータを最新化しておく（再レンダーなし）
        if (mainTab === "scenes") {
          current.scenes[selectedItem].hotspots[hIndex].states[sIndex].style.rotate = Math.floor(newRotate);
        } else if (mainTab === "items") {
          current.items[selectedItem].hotspots[hIndex].states[sIndex].style.rotate = Math.floor(newRotate);
        }
    
      }
    
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    
        // ✅ 確定時のみ state 更新
        setGameData(structuredClone(gameDataRef.current));
      };
    
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    return ({
        onDragStart,
        handleResizeStart,
        handleRotateStart
    })
}