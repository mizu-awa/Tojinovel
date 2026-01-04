// src/hooks/useGameData.js
import { useEffect, useState } from "react";
import { mergeDefault } from "./useMerge";

export function useGameData(fileName, visitSceneEvent) {

  // states----------------------------------------------------------------------------------
  const [gameData, setGameData] = useState(null);
  const [currentSceneName, setCurrentSceneName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // functions-----------------------------------------------------------------------------------
  /* シーン遷移関数 */
  const moveScene = (sceneName) => {
    if(gameData){
        const ri = gameData.scenes.findIndex(r => r.name === sceneName);
        if(ri !== -1){
            setCurrentSceneName(sceneName);
            visitSceneEvent(sceneName, gameData);
        }
    }
  }

  /* 一括更新関数 */
  const updateGameData = (updater) => {
    setGameData((prev) => {
      const next = updater(prev); // updater が返したオブジェクトを使う
      return next;
    });
  };

  /* ロード関数 */
  const loadGameData = (data) => {
    if(data){
      setGameData(mergeDefault(data.gameData));
      setCurrentSceneName(data.opData.currentSceneName);
    }
  }

  // effects----------------------------------------------------------------------------------
  useEffect(() => {
    setLoading(true);
    fetch(`${fileName}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load game data");
        return res.json();
      })
      .then((data) => {
        setGameData(mergeDefault(data));
        setCurrentSceneName(data.game.startScene);
        visitSceneEvent(data.game.startScene,data)
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [fileName]);

  // export---------------------------------------------------------------------------------------
  if(!loading){
    // 現在のシーン自体を更新
    const currentScene = gameData.scenes.find(r => r.name === currentSceneName);

    return {
        gameData :gameData,
        currentScene: currentScene,
        updateGameData: updateGameData,
        moveScene: moveScene,
        loadGameData: loadGameData,
        loading : loading,
        error : error
    };
  }

  return {
    loading : loading,
    error : error
  };
}
