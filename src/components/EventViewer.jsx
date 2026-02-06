import { useEffect, useState, memo } from "react";
import useEventExecution from "../hooks/useEventExecution";

function EventViewer({ 
  lines,
  onComplete,
  gameData,
  updateGameData,
  setViewItemName,
  fileJump,
  moveScene,
  index, setIndex,
  characterSlots, setCharacterSlots,
  currentLine, setCurrentLine,
  currentOptions, setCurrentOptions,
  currentBack, setCurrentBack,
  currentImage, setCurrentImage,
  hiddenCharacter, hideCharacter,
  currentInput, setCurrentInput,
  ifDepth, opDepth, opLabel,
  bgm,
  forEdit,
  openSave, openLoad, saveGame, loadGame,
  audioManager,
  openConfig,
  startTimer, stopTimer, restartTimer,
  onConsoleLog
}) {

  // states-----------------------------------------------------------------------------------------------------------------------
  const [visibleCount, setVisibleCount] = useState(0);

  // useEventExecution----------------------------------------------------------------------------------------------------------------
  const {
        inputValue,
        getCharacterX,
        choiceOption,
        handleChange,
        commitInput,
        handleClick
    } = useEventExecution({ 
        lines,
        onComplete,
        gameData,
        updateGameData,
        setViewItemName,
        fileJump,
        moveScene,
        index, setIndex,
        characterSlots, setCharacterSlots,
        currentLine, setCurrentLine,
        setCurrentOptions,
        currentBack, setCurrentBack,
        currentImage, setCurrentImage,
        hiddenCharacter, hideCharacter,
        currentInput, setCurrentInput,
        ifDepth, opDepth, opLabel,
        bgm,
        forEdit,
        openSave, openLoad, saveGame, loadGame,
        audioManager,
        openConfig,
        startTimer, stopTimer, restartTimer,
        setVisibleCount,
        onConsoleLog
    });
  
  // effects--------------------------------------------------------------------------------------------------------------------
  // 文字送り TODO:Stateだと重いか？
  useEffect(() => {
    if(currentLine && currentLine.text && currentLine.text.length >= 1){
      if (visibleCount < currentLine.text.length) {
        if(gameData?.game?.textBox?.speed !== 0){
          const timer = setTimeout(() => {
            setVisibleCount(c => c + 1);
          }, gameData?.game?.textBox?.speed ?? 80);
          return () => clearTimeout(timer);
        }
        else{// スピード0の場合は文字送りなし
          setVisibleCount(currentLine.text.length);
        }
      }
    }
  }, [currentLine, visibleCount])

  // エンターキーでイベント進行
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 入力フォームまたは選択肢が表示されている場合は処理しない
      if (currentInput || currentOptions) {
        return;
      }
      
      // エンターキーが押された場合
      if (e.key === "Enter") {
        e.preventDefault();
        handleClick(lines);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lines, currentInput, currentOptions, handleClick])


  // calc const---------------------------------------------------------------------------------------------------------------
  const dir = gameData ? (gameData.game.itemBox.position === "right" || gameData.game.itemBox.position === "left") ? "row"
                : (gameData.game.itemBox.position === "top" || gameData.game.itemBox.position === "bottom") ? "column"
                : "row" : null;

  // render-------------------------------------------------------------------------------------------------------------------
  // イベントが読み込めていない場合は何も表示しない
  if(!lines || !gameData){
    return null;
  }

  // 中身がないときもクリック要素を設置
  if (lines.length === 0 || !currentLine) return (
    <ClickArea onClick={() => handleClick(lines)} />
  );

  const itemBoxSize = gameData.game.itemBox.foldable ? 0 : gameData.game.itemBox.size;

  return (
    <>
      {/* 背景 */}
      <Background
        currentBack={currentBack}
        width={dir === "row" ? gameData.game.screenSize[0] - itemBoxSize : "100%"}
        height={dir === "row" ? "100%" : gameData.game.screenSize[1] - itemBoxSize}
      />

      {/* 画像 */}
      {currentImage &&
        <img
          src={currentImage}
          draggable={false}
          style={{
            ...gameData.game.image.style,
            position: "absolute",
            top: gameData.game.image.position[1],
            left: gameData.game.image.position[0],
            maxWidth: gameData.game.image.size[0],
            maxHeight: gameData.game.image.size[1],
            height: "auto",
            width: "auto",
            zIndex: 2001
          }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "./system/transparent.png";
          }}
        />
      }

      {/* キャラクター */}
      {!hiddenCharacter &&
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: dir === "row" ? gameData.game.screenSize[0] - itemBoxSize : "100%",
          height: dir === "row" ? "100%" : gameData.game.screenSize[1] - itemBoxSize,
          overflow: "hidden",
          zIndex: 2001
        }}
      >
        {characterSlots.map((ch, i) => {
          // 画像が指定されている場合のみ表示
          if(ch.nowImage){
            return(
              <img
                key={ch.name}
                src={ch.nowImage}
                alt={ch.name}
                style={{
                  position: "absolute",
                  left: `${getCharacterX(i,characterSlots.length)}%`,
                  bottom: 0,
                  maxWidth: `${( 140 / characterSlots.length )}%`,
                  maxHeight: "90%",
                  width: "auto",
                  height: "auto",
                  filter: currentLine.char === ch.name ? "none" : "brightness(0.8)",
                  transform: "translateX(-50%)"
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "./system/transparent.png";
                }}
              />
            )}
          return null;
        })}
      </div>}

      {/* 名前表示 */}
      {currentLine.char &&
        <div
          style={{
            ...{...gameData.game.textBox.nameStyle, padding: "10px"},
            position: "absolute",
            color: gameData.game.textBox.style.color,
            left: gameData.game.textBox.position[0],
            bottom: `calc(100% - ${gameData.game.textBox.position[1]}px)`,
            borderTop: `${gameData.game.textBox.style.borderTopWidth} ${gameData.game.textBox.style.borderTopStyle} ${gameData.game.textBox.style.borderTopColor}`,
            borderLeft: `${gameData.game.textBox.style.borderTopWidth} ${gameData.game.textBox.style.borderTopStyle} ${gameData.game.textBox.style.borderTopColor}`,
            borderRight: `${gameData.game.textBox.style.borderTopWidth} ${gameData.game.textBox.style.borderTopStyle} ${gameData.game.textBox.style.borderTopColor}`,
            borderBottom: "none",
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderTopLeftRadius: gameData.game.textBox.style.borderTopRightRadius,
            borderTopRightRadius: gameData.game.textBox.style.borderTopRightRadius,
            minWidth: "15%",
            zIndex: 2002,
            boxSizing: "border-box",
            fontSize: gameData.game.textBox.style.fontSize
          }}
        >
          <span>{currentLine.char}</span>
        </div>
      }
      
      {/* テキストボックス */}
      {currentLine.text &&
      <div
        style={{
            ...gameData.game.textBox.style,
            position: "absolute",
            left: gameData.game.textBox.position[0],
            top: gameData.game.textBox.position[1],
            width: gameData.game.textBox.size[0],
            height: gameData.game.textBox.size[1],
            zIndex: 2002,
            overflowY: "auto",
            whiteSpace: "pre-line",
            boxSizing: "border-box",
            borderTopLeftRadius: currentLine.char ? 0 : gameData.game.textBox.style.borderTopRightRadius,
            borderBottomLeftRadius: gameData.game.textBox.style.borderTopRightRadius,
            borderBottomRightRadius: gameData.game.textBox.style.borderTopRightRadius,
            borderLeft: `${gameData.game.textBox.style.borderTopWidth} ${gameData.game.textBox.style.borderTopStyle} ${gameData.game.textBox.style.borderTopColor}`,
            borderRight: `${gameData.game.textBox.style.borderTopWidth} ${gameData.game.textBox.style.borderTopStyle} ${gameData.game.textBox.style.borderTopColor}`,
            borderBottom: `${gameData.game.textBox.style.borderTopWidth} ${gameData.game.textBox.style.borderTopStyle} ${gameData.game.textBox.style.borderTopColor}`,

        }}
      >
        <span
          style={{
            fontSize: currentLine.volume === "big" ? "170%" : currentLine.volume === "small" ? "75%" : "100%"
          }}
        >
          {
            currentLine.text.slice(0,visibleCount).map((part, i) =>
               part.highlight ? (
                <span
                  key={i}
                  style={{
                    fontWeight: "bolder",
                    color: gameData.game.textBox.highlightStyle.color,
                    textShadow:`1px 1px 0 ${gameData.game.textBox.highlightStyle.strokeColor},
                      -1px -1px 0 ${gameData.game.textBox.highlightStyle.strokeColor},
                      -1px 1px 0 ${gameData.game.textBox.highlightStyle.strokeColor},
                      1px -1px 0 ${gameData.game.textBox.highlightStyle.strokeColor},
                      0px 1px 0 ${gameData.game.textBox.highlightStyle.strokeColor}, 
                      0-1px 0 ${gameData.game.textBox.highlightStyle.strokeColor},
                      -1px 0 0 ${gameData.game.textBox.highlightStyle.strokeColor},
                      1px 0 0 ${gameData.game.textBox.highlightStyle.strokeColor}`
                  }}
                >
                  {part.char} 
                </span>
              ) 
              : (part.char)
            )}
        </span>
      </div>}

      {/* クリック要素（通常） */}
      {!forEdit && <ClickArea zIndex={2003} onClick={() => {handleClick(lines)}} />}

      {/* クリック要素（文字送り停止） */}
      {(!forEdit && visibleCount && currentLine.text && (visibleCount < currentLine.text.length)) &&
        <ClickArea zIndex={2004} onClick={() => {setVisibleCount(currentLine.text.length)}} />
      }

      {/* クリック要素（文字送り停止）（エディタ用） */}
      {(forEdit && visibleCount && currentLine.text && (visibleCount >= currentLine.text.length)) &&
        <ClickArea zIndex={2004} onClick={() => {setVisibleCount(0)}} />
      }

      {/* 選択肢 */}
      <Options
        options={currentOptions}
        screenSize={gameData.game.screenSize}
        config={gameData.game.option}
        choiceOption={choiceOption}
      />

      {/* 入力フォーム */}
      <Input
        config={gameData.game.input}
        inputVar={currentInput}
        inputValue={inputValue}
        handleChange={handleChange}
        commitInput={commitInput}
      />
    </>
  );
}

// クリック要素
function ClickArea({onClick, zIndex}){
  return(
    <div
      onClick={onClick}
      style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          left: 0,
          top: 0,
          zIndex: zIndex,
          backgroundColor: "transparent"
     }}
    />
  )
}

// 選択肢
function Options({options, config, choiceOption}){
  // 選択肢がない場合は非表示
  if(!options) return null;
  return(
    // クリック要素のクリック防止のために全体に広げる
    <div
      style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 2005,
          backgroundColor: "transparent"
      }}
    >
      <div
        style={{
          position: "absolute",
          left: config.position[0],
          top: config.position[1],
          display: "flex",
          flexDirection: "column",
          gap: config.gap
        }}
      >
        {options.map(option => {
          return(
            <div
              key={option}
              className={config.hover}
              style={{
                ...config.style,
                width: config.size,
                position: "relative"
              }}
              onClick={() => {choiceOption(option)}}
            >
              {option}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Background({currentBack, width, height}){
  const [backs, setBacks] = useState([]);

  useEffect(()=>{
    setBacks([...backs, currentBack].slice(-2));
  }, [currentBack])

  const noBack = backs.at(-1) ? !( backs.at(-1).color || backs.at(-1).url ) : true;
  const lastIndex = backs.length - 1;
  const lastAnimation = backs[lastIndex] ? backs[lastIndex].animation : null;
  const newBacks = ( lastAnimation && lastAnimation.startsWith("uncover") ) ? backs.slice().reverse() : backs;

  return(
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: width,
        height: height,
        overflow: "hidden",
        zIndex: 2000
      }}
    >
      {newBacks.map((back, i) =>{
        return(
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              backgroundColor: back.color || "transparent",
              visibility: !lastAnimation ? i === lastIndex ?  "visible" : "hidden" : "visible"
            }}
            className={
                lastAnimation === "fade" ? noBack ? "fade-out" : i === lastIndex ? "fade-in" : ""
              : lastAnimation === "pushL" ? i === lastIndex ? "push-left-in" : "push-left-out"
              : lastAnimation === "pushR" ? i === lastIndex ? "push-right-in" : "push-right-out"
              : lastAnimation === "pushU" ? i === lastIndex ? "push-up-in" : "push-up-out"
              : lastAnimation === "pushD" ? i === lastIndex ? "push-down-in" : "push-down-out"
              : lastAnimation === "coverL" ? noBack ? "push-left-out" : i === lastIndex ? "push-left-in": ""
              : lastAnimation === "coverR" ? noBack ? "push-right-out" : i === lastIndex ? "push-right-in": ""
              : lastAnimation === "coverU" ? noBack ? "push-up-out" : i === lastIndex ? "push-up-in": ""
              : lastAnimation === "coverD" ? noBack ? "push-down-out" : i === lastIndex ? "push-down-in": ""
              : lastAnimation === "uncoverL" ? noBack ? "push-left-out" : i === lastIndex ? "push-left-out": ""
              : lastAnimation === "uncoverR" ? noBack ? "push-right-out" : i === lastIndex ? "push-right-out": ""
              : lastAnimation === "uncoverU" ? noBack ? "push-up-out" : i === lastIndex ? "push-up-out": ""
              : lastAnimation === "uncoverD" ? noBack ? "push-down-out" : i === lastIndex ? "push-down-out": ""
              : lastAnimation === "wipeL" ? noBack ? "wipe-left-out" : i === lastIndex ? "wipe-left-in": ""
              : lastAnimation === "wipeR" ? noBack ? "wipe-right-out" : i === lastIndex ? "wipe-right-in": ""
              : lastAnimation === "wipeU" ? noBack ? "wipe-up-out" : i === lastIndex ? "wipe-up-in": ""
              : lastAnimation === "wipeD" ? noBack ? "wipe-down-out" : i === lastIndex ? "wipe-down-in": ""
              : ""
            }
            key={back.color + back.url + back.animation + i}
          >
            {back.url && 
            <img
              src={back.url}
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
            />}
          </div>
      )})}
    </div>
  )
}

function Input({config, inputVar, inputValue, handleChange, commitInput }){
  // 格納対象の変数がない場合は表示しない
  if(!inputVar) return null;

  return(
    // クリック要素のクリック防止のために全体に広げる
    <div
      style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 2005,
          backgroundColor: "transparent"
      }}
    >
      <div
        style={{
          ...config.backStyle,
          position: "absolute",
          left: config.position[0],
          top: config.position[1],
          width: config.size[0],
          height: config.size[1],
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <input
          type="text"
          onChange={handleChange}
          value={inputValue}
          style={{
            ...config.inputStyle,
            display: "block",
            marginBottom: "1em",
            width: "80%",
            appearance: "none"
          }}
        />
        <button
          onClick={commitInput}
          className={config.hover}
          style={{
            ...config.buttonStyle,
            display: "block",
            appearance: "none",
            position: "relative"
          }}
        >
          決定
        </button>
      </div>
    </div>
  )
}

export default memo(EventViewer);