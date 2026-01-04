import { defaultGameData } from "../datas/defaultGameData";

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
    const changes = [];
    const result = deepMergeWithDefaults(defaultGameData, gameData, "", changes);
    console.log("データ補完を実施 補完箇所を表示")
    console.table(changes);
    return result;
}