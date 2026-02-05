import useEventExecution from "../hooks/useEventExecution";

const noop = () => {};

export default function BackgroundEventRunner({ 
  lines,
  onComplete,
  gameData,
  updateGameData,
  setViewItemName,
  fileJump,
  moveScene,
  index, setIndex,
  //characterSlots, setCharacterSlots,
  //currentLine, setCurrentLine,
  //setCurrentOptions,
  //currentBack, setCurrentBack,
  //currentImage, setCurrentImage,
  //hiddenCharacter, hideCharacter,
  //currentInput, setCurrentInput,
  ifDepth, opDepth, opLabel,
  bgm,
  forEdit,
  openSave, openLoad, saveGame, loadGame,
  audioManager,
  openConfig,
  startTimer, stopTimer, restartTimer,
  onConsoleLog,
}) {
  useEventExecution({//TODO: バックグラウンド実行に不要なデータはnullで渡している バグが起きそう
    lines,
    onComplete,
    gameData,
    updateGameData,
    setViewItemName,
    fileJump,
    moveScene,
    index, setIndex,
    characterSlots: [], setCharacterSlots: noop,
    currentLine: null, setCurrentLine: noop,
    setCurrentOptions: noop,
    currentBack: null, setCurrentBack: noop,
    currentImage: null, setCurrentImage: noop,
    hiddenCharacter: null, hideCharacter: noop,
    currentInput: null, setCurrentInput: noop,
    ifDepth, opDepth, opLabel,
    bgm,
    forEdit,
    openSave, openLoad, saveGame, loadGame,
    audioManager,
    openConfig,
    startTimer, stopTimer, restartTimer,
    setVisibleCount: noop,
    onConsoleLog
  });
  return null;
}
