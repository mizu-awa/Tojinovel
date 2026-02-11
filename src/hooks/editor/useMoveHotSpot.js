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

        const startMouseX = e.clientX;
        const startMouseY = e.clientY;

        const hIndex = Number(e.currentTarget.dataset.hindex);
        const sIndex = Number(e.currentTarget.dataset.sindex);

        // ✅ 最新データをrefから取得
        const current = gameDataRef.current;
        const stateData =
          mainTab === "scenes"
            ? current.scenes[selectedItem]?.hotspots[hIndex]?.states[sIndex]
            : mainTab === "items"
            ? current.items[selectedItem]?.hotspots[hIndex]?.states[sIndex]
            : null;

        if (!stateData) return;

        const startX = stateData.x;
        const startY = stateData.y;

        // 拡大率を取得しておく
        const match = ref.current.style.transform.match(/scale\(([^)]+)\)/);
        const scale = ( match ? parseFloat(match[1]) : 1 ); // scaleがなければ1を返す


        // ✅ hotspot要素への参照（ドラッグ中、これを直接動かす）
        const hotspotEl = hotspotRefs.current?.[`${hIndex}-${sIndex}`];
        if (!hotspotEl) return;

        let hasMoved = false;

        const onMouseMove = (e) => {
          // 実際に動いた時にだけundoスナップショットを取る
          if (!hasMoved) {
            debouncedDoAction(true);
            hasMoved = true;
          }

          let dx = (e.clientX - startMouseX) / scale;
          let dy = (e.clientY - startMouseY) / scale;

          // Shift: 水平・垂直にスナップ
          if (e.shiftKey) {
            if (Math.abs(dx) > Math.abs(dy)) {
              dy = 0;
            } else {
              dx = 0;
            }
          }

          // 即時描画
          const newX = startX + dx;
          const newY = startY + dy;

          hotspotEl.style.left = `${newX}px`;
          hotspotEl.style.top = `${newY}px`;

          // refデータを最新化しておく（再レンダーなし）
          if (mainTab === "scenes") {
            current.scenes[selectedItem].hotspots[hIndex].states[sIndex].x = Math.floor(newX);
            current.scenes[selectedItem].hotspots[hIndex].states[sIndex].y = Math.floor(newY);
          } else if (mainTab === "items") {
            current.items[selectedItem].hotspots[hIndex].states[sIndex].x = Math.floor(newX);
            current.items[selectedItem].hotspots[hIndex].states[sIndex].y = Math.floor(newY);
          }
        };

        const onMouseUp = () => {
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);

          // ✅ 実際に移動した場合のみ state 更新
          if (hasMoved) {
            setGameData(structuredClone(gameDataRef.current));
          }
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
      const stateData =
        mainTab === "scenes"
          ? current.scenes[selectedItem]?.hotspots[hIndex]?.states[sIndex]
          : mainTab === "items"
          ? current.items[selectedItem]?.hotspots[hIndex]?.states[sIndex]
          : null;

      if (!stateData) return;

      // ✅ hotspot要素への参照（ドラッグ中、これを直接動かす）
      const hotspotEl = hotspotRefs.current?.[`${hIndex}-${sIndex}`];
      if (!hotspotEl) return;

      const startX = stateData.x;
      const startY = stateData.y;
      const startWidth = stateData.width;
      const startHeight = stateData.height;

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
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;

      const aspectRatio = startWidth / startHeight;

      const onMouseMove = (e) => {
        const dx = (e.clientX - startMouseX) / scale;
        const dy = (e.clientY - startMouseY) / scale;

        // --- 回転角を逆方向に適用して、ローカル座標系での変化に変換する ---
        const localDx = dx * Math.cos(-rad) - dy * Math.sin(-rad);
        const localDy = dx * Math.sin(-rad) + dy * Math.cos(-rad);

        const centerMode = e.ctrlKey || e.metaKey; // Ctrl: 中心固定リサイズ

        let newWidth = startWidth;
        let newHeight = startHeight;
        let offsetX = 0;
        let offsetY = 0;

        // corner: "tl", "br" など
        if (corner.includes("l")) {
          newWidth -= localDx;
          offsetX += centerMode ? localDx / 2 : localDx; // 対辺固定 or 中心固定
        }
        if (corner.includes("r")) {
          newWidth += localDx;
          offsetX += centerMode ? localDx / 2 : 0;
        }
        if (corner.includes("t")) {
          newHeight -= localDy;
          offsetY += centerMode ? localDy / 2 : localDy;
        }
        if (corner.includes("b")) {
          newHeight += localDy;
          offsetY += centerMode ? localDy / 2 : 0;
        }

        // Shift: コーナーハンドルは縦横比維持
        if (e.shiftKey && corner.length === 2) {
          // 幅と高さの変化量のうち、大きい方に合わせる
          const dw = newWidth - startWidth;
          const dh = newHeight - startHeight;
          if (Math.abs(dw / startWidth) > Math.abs(dh / startHeight)) {
            // 幅基準で高さを算出
            newHeight = newWidth / aspectRatio;
          } else {
            // 高さ基準で幅を算出
            newWidth = newHeight * aspectRatio;
          }
          // offset を再計算
          const actualDw = newWidth - startWidth;
          const actualDh = newHeight - startHeight;
          offsetX = 0;
          offsetY = 0;
          if (corner.includes("l")) {
            offsetX += centerMode ? -actualDw / 2 : -actualDw;
          }
          if (corner.includes("r")) {
            offsetX += centerMode ? actualDw / 2 : 0;
          }
          if (corner.includes("t")) {
            offsetY += centerMode ? -actualDh / 2 : -actualDh;
          }
          if (corner.includes("b")) {
            offsetY += centerMode ? actualDh / 2 : 0;
          }
        }

        // 新しい左上座標（ローカル補正 → グローバルに変換）
        const globalOffsetX = offsetX * Math.cos(rad) - offsetY * Math.sin(rad);
        const globalOffsetY = offsetX * Math.sin(rad) + offsetY * Math.cos(rad);
        const newX = startX + globalOffsetX;
        const newY = startY + globalOffsetY;

        hotspotEl.style.left = `${newX}px`;
        hotspotEl.style.top = `${newY}px`;
        hotspotEl.style.width = `${newWidth}px`;
        hotspotEl.style.height = `${newHeight}px`;

        // refデータを最新化しておく（再レンダーなし）
        const targetState = mainTab === "scenes"
          ? current.scenes[selectedItem].hotspots[hIndex].states[sIndex]
          : current.items[selectedItem].hotspots[hIndex].states[sIndex];

        if (targetState) {
          targetState.x = Math.floor(newX);
          targetState.y = Math.floor(newY);
          targetState.width = Math.floor(newWidth);
          targetState.height = Math.floor(newHeight);
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
        let newRotate = ( rotate + delta ) % 360;
        // Shift: 15度刻みにスナップ
        if (e.shiftKey) {
          newRotate = Math.round(newRotate / 15) * 15;
        }
    
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