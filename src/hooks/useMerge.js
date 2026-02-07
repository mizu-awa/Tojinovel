import { defaultGameData } from "../datas/defaultGameData";

// 古いデータ形式（area: [x0, y0, x1, y1]）を新形式（x, y, width, height）に変換
function convertAreaToXYWH(state) {
  if (state.area && state.x === undefined) {
    state.x = state.area[0];
    state.y = state.area[1];
    state.width = state.area[2] - state.area[0];
    state.height = state.area[3] - state.area[1];
    delete state.area;
    return true; // 変換が行われた
  }
  return false;
}

// すべてのホットスポットのステートを変換
function convertAllStates(gameData) {
  let converted = false;

  // シーンのホットスポット
  if (gameData.scenes) {
    for (const scene of gameData.scenes) {
      if (scene.hotspots) {
        for (const hotspot of scene.hotspots) {
          if (hotspot.states) {
            for (const state of hotspot.states) {
              if (convertAreaToXYWH(state)) {
                converted = true;
              }
            }
          }
        }
      }
    }
  }

  // アイテムのホットスポット
  if (gameData.items) {
    for (const item of gameData.items) {
      if (item.hotspots) {
        for (const hotspot of item.hotspots) {
          if (hotspot.states) {
            for (const state of hotspot.states) {
              if (convertAreaToXYWH(state)) {
                converted = true;
              }
            }
          }
        }
      }
    }
  }

  if (converted) {
    console.log("古いデータ形式（area）を新形式（x, y, width, height）に変換しました");
  }
}

function deepMergeWithDefaults(schema, data, path="", changes = []) {
  if (Array.isArray(schema)) {
    if (Array.isArray(data)) {
      if (schema.length === 0) return data;
      return data.map((d, i) => deepMergeWithDefaults(schema[0], d,`${path}[${i}]`), changes);
    } else {
      changes.push({ path, action: "useDefaultArray" });
      return schema;
    }
  } else if (typeof schema === "object" && schema !== null) {
    if (typeof data !== "object" || data === null) {
      changes.push({ path, action: "useDefaultObject" });
      return schema;
    }
    const result = { ...data }; // 余分なキーも保持
    for (const key in schema) {
      result[key] = deepMergeWithDefaults(schema[key], data[key], `${path}.${key}` ,changes);
    }
    return result;
  } else {
    if(data === undefined){
      changes.push({ path, action: "addedDefault" });
    }
    return data !== undefined ? data : schema;
  }
}

export function mergeDefault(gameData){
    // 古いデータ形式（area）を新形式（x, y, width, height）に変換
    // デフォルト値補完より先に実行する必要がある（補完後だと x が既に存在し変換がスキップされる）
    convertAllStates(gameData);

    const changes = [];
    const result = deepMergeWithDefaults(defaultGameData, gameData, "", changes);
    console.log("データ補完を実施 補完箇所を表示")
    console.table(changes);

    return result;
}