// スナップ計算ロジック
// ホットスポットの移動・リサイズ時に、他ホットスポットの辺/中心線やシーン中央にスナップする

export const SNAP_THRESHOLD = 5;

// 他ホットスポット + シーン中央から、スナップ対象の垂直線・水平線を収集する
function collectSnapLines(otherHotspots, screenSize) {
  const vLines = []; // 垂直線（x座標）
  const hLines = []; // 水平線（y座標）

  // シーン端・中央
  vLines.push(0, screenSize[0] / 2, screenSize[0]);
  hLines.push(0, screenSize[1] / 2, screenSize[1]);

  // 各ホットスポットの辺・中心
  for (const hs of otherHotspots) {
    const { x, y, width, height } = hs;
    vLines.push(x, x + width / 2, x + width);
    hLines.push(y, y + height / 2, y + height);
  }

  return { vLines, hLines };
}

// 最も近いスナップ先を探す
function findClosest(value, targets, threshold) {
  let best = null;
  let bestDist = threshold + 1;
  for (const target of targets) {
    const dist = Math.abs(value - target);
    if (dist < bestDist) {
      bestDist = dist;
      best = target;
    }
  }
  return best;
}

// 移動時のスナップ計算
// 自分の辺/中心（left, centerX, right, top, centerY, bottom）をスナップ対象と比較
// 戻り値: { x, y, guideLines: [{type: 'v'|'h', pos}] }
export function calcSnapMove(x, y, width, height, otherHotspots, screenSize, threshold = SNAP_THRESHOLD) {
  const { vLines, hLines } = collectSnapLines(otherHotspots, screenSize);
  const guideLines = [];

  // 自分の垂直基準点: left, center, right
  const myVPoints = [x, x + width / 2, x + width];
  // 自分の水平基準点: top, center, bottom
  const myHPoints = [y, y + height / 2, y + height];

  let snappedX = x;
  let snappedY = y;
  let bestVDist = threshold + 1;
  let bestHDist = threshold + 1;

  // 垂直方向のスナップ
  for (const point of myVPoints) {
    const offset = point - x; // この基準点と左辺の差
    const closest = findClosest(point, vLines, threshold);
    if (closest !== null) {
      const dist = Math.abs(point - closest);
      if (dist < bestVDist) {
        bestVDist = dist;
        snappedX = closest - offset;
      }
    }
  }

  // 水平方向のスナップ
  for (const point of myHPoints) {
    const offset = point - y;
    const closest = findClosest(point, hLines, threshold);
    if (closest !== null) {
      const dist = Math.abs(point - closest);
      if (dist < bestHDist) {
        bestHDist = dist;
        snappedY = closest - offset;
      }
    }
  }

  // スナップした線をガイドラインとして返す
  if (bestVDist <= threshold) {
    // snappedXに対応する基準点の位置がガイドライン
    for (const point of [snappedX, snappedX + width / 2, snappedX + width]) {
      if (vLines.some(v => Math.abs(v - point) < 0.5)) {
        guideLines.push({ type: "v", pos: point });
        break;
      }
    }
  }
  if (bestHDist <= threshold) {
    for (const point of [snappedY, snappedY + height / 2, snappedY + height]) {
      if (hLines.some(h => Math.abs(h - point) < 0.5)) {
        guideLines.push({ type: "h", pos: point });
        break;
      }
    }
  }

  return { x: snappedX, y: snappedY, guideLines };
}

// リサイズ時のスナップ計算
// 動いている辺だけをスナップ対象にする
// corner: "tl", "t", "tr", "r", "br", "b", "bl", "l"
// 戻り値: { x, y, width, height, guideLines }
export function calcSnapResize(x, y, width, height, corner, otherHotspots, screenSize, threshold = SNAP_THRESHOLD) {
  const { vLines, hLines } = collectSnapLines(otherHotspots, screenSize);
  const guideLines = [];

  let newX = x;
  let newY = y;
  let newW = width;
  let newH = height;

  // 右辺が動いている場合
  if (corner.includes("r")) {
    const right = x + width;
    const closest = findClosest(right, vLines, threshold);
    if (closest !== null) {
      newW = closest - x;
      guideLines.push({ type: "v", pos: closest });
    }
  }
  // 左辺が動いている場合
  if (corner.includes("l")) {
    const closest = findClosest(x, vLines, threshold);
    if (closest !== null) {
      newW = width + (x - closest);
      newX = closest;
      guideLines.push({ type: "v", pos: closest });
    }
  }
  // 下辺が動いている場合
  if (corner.includes("b")) {
    const bottom = y + height;
    const closest = findClosest(bottom, hLines, threshold);
    if (closest !== null) {
      newH = closest - y;
      guideLines.push({ type: "h", pos: closest });
    }
  }
  // 上辺が動いている場合
  if (corner.includes("t")) {
    const closest = findClosest(y, hLines, threshold);
    if (closest !== null) {
      newH = height + (y - closest);
      newY = closest;
      guideLines.push({ type: "h", pos: closest });
    }
  }

  return { x: newX, y: newY, width: newW, height: newH, guideLines };
}

// 現在のシーン/アイテムから、ドラッグ中のホットスポットを除いた
// visibility=true のホットスポットの位置情報を取得する
export function getVisibleHotspotRects(hotspots, excludeIndex) {
  const rects = [];
  if (!hotspots) return rects;

  for (let i = 0; i < hotspots.length; i++) {
    if (i === excludeIndex) continue;
    const hs = hotspots[i];
    // 現在のアクティブステートを取得
    const stateData = hs.states.find(s => s.name === hs.state);
    if (!stateData || !stateData.visibility) continue;
    rects.push({
      x: stateData.x,
      y: stateData.y,
      width: stateData.width,
      height: stateData.height,
    });
  }
  return rects;
}
