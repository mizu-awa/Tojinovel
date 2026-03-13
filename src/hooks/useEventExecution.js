import { useEffect, useState, useRef } from "react";
import {
    parseIfNumber,
    evalCompoundCondition,
    calcFlag,
    random,
    expandVarsShallow,
    parseLineText
} from "./eventExecutionUtils.js";
import { exitAnimations } from "./useEventLines.js";

export default function useEventViewer({
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
  currentOptions,setCurrentOptions,
  currentBack, setCurrentBack,
  currentImage, setCurrentImage,
  hiddenCharacter, hideCharacter,
  currentInput, setCurrentInput,
  ifDepth, ifMatched, opDepth, opLabel,
  bgm,
  forEdit,
  openSave, openLoad, saveGame, loadGame,
  audioManager,
  openConfig,
  startTimer, stopTimer, restartTimer,
  setVisibleCount,
  onConsoleLog,
  currentSceneName,
  viewItemName,
  selectItem,
  screenEffect, setScreenEffect
}){
    // states------------------------------------------------------------------------------------------
    const [inputValue, setInputValue] = useState("");

    // refs----------------------------------------------------------------------------------------------
    const ifSkip = useRef(false);
    const opSkip = useRef(false);
    const lastClickSkip = useRef(true);
    const animEndTimer = useRef(null); // アニメーション完了待ちタイマー
    const viewItemNameRef = useRef(viewItemName);
    
    // functions-----------------------------------------------------------------------------------------
    /* キャラクター表情更新時の処理 */
    const onCharacterExpression = (line, slots) => {
        // 表情の更新関数
        const updateImage = (ch) => {
            // テキストで指定された表情を探す
            const expression = ch.expressions.find((e) => e.name === line.expression);
            // 表情がある場合
            if( expression ){
                // 表情の画像パスを返す
                return expression.image
            }
            // 表情が見つからないが、すでに立ち絵が表示されている場合
            else if(ch.nowImage){
                // 今の表情を返す
                return ch.nowImage
            }

            // デフォルトの表情を探す
            const defaultExpression = ch.expressions.find((e) => e.name === ch.defaultExpression);
            // デフォルトの表情がある場合
            if(defaultExpression){
                // デフォルトの表情を返す
                return defaultExpression.image;
            }
            // いずれにも当てはまらない場合は立ち絵なし
            return null;
        }

        const now = Date.now(); // 現在の時刻（登場してから最も時間が経過した立ち絵から削除する）
        const characterSlotsBuf = [...slots]; // 現在のスロットを退避
        const fi = characterSlotsBuf.findIndex(s => s.name === line.char); // 発言中のキャラクターのスロット番号

        // アニメーション情報（あれば付与、なければnull）
        const anim = line.animation || null;
        const animKey = anim ? Date.now() : undefined;

        // すでに登場している場合
        if (fi !== -1) {
            const character = characterSlotsBuf[fi];
            // 表情を更新
            characterSlotsBuf[fi] = {...character, nowImage: updateImage(character), lastSpoken: now, animation: anim, animationKey: animKey};
        }
        // 空きスロットがあれば追加する
        else if (characterSlotsBuf.length < gameData.game.character.slots) {
            //キャラクターが定義されているかどうか確認
            const character = gameData.characters.find(c => c.name === line.char);
            if(character){
                // 配列に追加する形で追加
                characterSlotsBuf.push({ ...character, lastSpoken: now, nowImage: updateImage(character), animation: anim, animationKey: animKey });
            }
        }
        // 空きがなければ最も古いキャラを探して置き換え
        else{
            //キャラクターが定義されているかどうか確認
            const character = gameData.characters.find(c => c.name === line.char);
            if(character){
                let oldestIndex = 0;
                // ループで最も最終登場時刻が古いキャラクターを特定
                for (let i = 1; i < characterSlotsBuf.length; i++) {
                    if (characterSlotsBuf[i].lastSpoken < characterSlotsBuf[oldestIndex].lastSpoken) {
                    oldestIndex = i;
                    }
                }
                // キャラクターを新規キャラクターで上書き
                characterSlotsBuf[oldestIndex] = ({ ...character, lastSpoken: now, nowImage: updateImage(character), animation: anim, animationKey: animKey });
            }
        }

        return characterSlotsBuf;
    }

    // 立ち絵表示位置計算
    function getCharacterX(i, characterNum) {
        const centerX = 50;   // 中央を 50% とする
        const spacing = 90 / characterNum;   // 1スロットごとの間隔(%)

        // 偶数・奇数で左右対称にするための工夫
        const offset = (i - (characterNum - 1) / 2) * spacing;

        return centerX + offset;
    }

    // キャラ退場関数
    function exitCharacter(line, slots){
        let characterSlotsBuf = [...slots]; // キャラクタースロット退避
        const fi = characterSlotsBuf.findIndex(s => s.name === line.char); // 登場キャラのインデックス

        // 登場している場合
        if (fi !== -1) {
            // 退場アニメーションがある場合はアニメーション付きでスロットに残す（EventViewerのonAnimationEndで削除）
            if (line.animation && exitAnimations.has(line.animation)) {
                const character = characterSlotsBuf[fi];
                characterSlotsBuf[fi] = {...character, animation: line.animation, animationKey: Date.now(), exiting: true};
                return characterSlotsBuf;
            }
            characterSlotsBuf.splice(fi, 1); // 即削除
            return characterSlotsBuf;
        }
        return slots;
    }

    // 選択肢をクリックしたとき
    const choiceOption = (option) => {
        // 選んだ選択肢を登録
        opLabel.current = option;
        // クリックイベントを起こす
        handleClick(lines);
    }

    // 入力フォーム用
    const handleChange = (event) => {
        setInputValue(event.target.value);
    }

    // 入力フォーム決定時
    const commitInput = () => {
        // クリックイベントを起こす
        handleClick(lines);
    }

    function openLink(url, target = "_blank") {
        if (!url) return;
        const safeTarget = target || "_blank";
        window.open(url, safeTarget, "noopener,noreferrer");
    }

    // クリック時処理
    const handleClick = (lines) => {
        // 選択肢表示中は choiceOption 経由（opLabel セット済み）以外の呼び出しを無視
        if (currentOptions && opLabel.current === null) return;

        let newGameData = { ...gameData }; // 親に渡す更新データ
        const nLine = expandVarsShallow(lines.lines[index], newGameData.variables); // クリック待ちのために停止した行
        let cLine = currentLine; // 今表示している行の内容かつ、次に表示する行の内容。何もなければ表示に変化なし
        let i = index; // 処理する行数を示すインデックス
        let slots = [...characterSlots]; // キャラクタースロット
        let itemName = null; // 取得するアイテム（アイテムウィンドウを開く）
        let itemClose = false;
        let cOptions = null; // 選択肢（選択肢を開く）
        let fj = false;// ファイルジャンプ
        let cBack = {...currentBack};
        let cImage = currentImage;
        let hChar = hiddenCharacter;
        let cInput = currentInput;
        let ms = false;// シーン移動
        let cScreenEffect = null;// 画面エフェクト

        /* 現在の行の処理（クリック待ち要素） */
        if(nLine.type === "dialogue"){ // セリフ
            slots = onCharacterExpression(nLine, slots);
            // セリフ音声を再生
            audioManager.stopVoice();
            if(nLine.sound && nLine.sound !== undefined){
                audioManager.playVoice(nLine.sound, newGameData.game.sound.voice);
            }
            cLine = {...nLine, text: parseLineText(nLine.text)};

            lastClickSkip.current = false;
            i++;
        }
        else if(nLine.type === "narration"){ // 地の文
            cLine = {...nLine, text: parseLineText(nLine.text)};

            lastClickSkip.current = false;
            i++;
        }
        else if(nLine.type === "click"){ //クリック要素

            lastClickSkip.current = true;
            i++;
        }
        else if(nLine.type === "startOption"){//選択肢開始
            cOptions = nLine.options;
            opSkip.current = false;

            lastClickSkip.current = false;
            i++;
        }
        else if(nLine.type === "afterSO"){//選択肢開始の直後
            opSkip.current = true;// 選択肢出現前の文は無視
            // 次のセリフ・地の文を強制実行
            cLine = null;

            lastClickSkip.current = true;
            i++;
        }
        else if(nLine.type === "input"){// 入力フォーム表示
            cInput = nLine.varName;

            lastClickSkip.current = false;
            i++;
        }
        else if(nLine.type === "afterInput"){// inputの直後
            // ゲームデータ書きかえ（変数）
            if(cInput){
                const variableIndex = newGameData.variables.findIndex(v => v.name === cInput);
                if(variableIndex !== -1){
                    newGameData.variables[variableIndex].value = parseIfNumber(inputValue);
                }
                else{
                    newGameData.variables.push({name: cInput, value: parseIfNumber(inputValue)});
                }
            }
            cInput = null;
            // 次のセリフ・地の文を強制実行
            cLine = null;

            lastClickSkip.current = true;
            i++;
        }

        /* クリック待ち命令実行後の式の評価 */
        while(i < lines.lines.length){
            const line = expandVarsShallow(lines.lines[i], newGameData.variables); // 処理する行
            
            if((line.type === "endif") && (line.depth === ifDepth.current)){ // if終了時
                // マッチ状態をクリア
                ifMatched.current.delete(line.depth);
                // if階層を1つ上げる
                ifDepth.current = Math.max(ifDepth.current - 1, 0);
                // ifによる命令スキップを解除
                ifSkip.current = false;
            }
            else if((line.type === "elseif") && (line.depth === ifDepth.current)){ // else if登場時
                if(ifMatched.current.get(line.depth)){ // 既にマッチ済み → スキップ
                    ifSkip.current = true;
                } else {
                    // >< 演算子用に現在のコンテキストのホットスポットを取得
                    const currentHotspots = (() => {
                        if (viewItemName) {
                            const item = newGameData.items.find(i => i.name === viewItemName);
                            return item ? item.hotspots : [];
                        }
                        const scene = newGameData.scenes.find(s => s.name === currentSceneName);
                        return scene ? scene.hotspots : [];
                    })();
                    const result = evalCompoundCondition(line.condition, newGameData.variables, currentHotspots);
                    ifSkip.current = !result;
                    if(result) ifMatched.current.set(line.depth, true);
                }
            }
            else if((line.type === "else") && (line.depth === ifDepth.current)){ // else登場時
                if(ifMatched.current.get(line.depth)){ // 既にマッチ済み → スキップ
                    ifSkip.current = true;
                } else {
                    ifSkip.current = false;
                }
            }
            else if((line.type === "endOption") && (line.depth === opDepth.current)){// 選択肢終了時
                // op階層を1つ上げる
                opDepth.current = Math.max(opDepth.current - 1, 0);
                // 選択肢による命令スキップを解除
                opSkip.current = false;
            }
            else if((line.type === "option") && (line.depth === opDepth.current)){// 選択肢ラベル出現時
                // 選択した選択肢と一致
                if(line.option === opLabel.current){
                    // 命令スキップを解除
                    opSkip.current = false;
                    // 選択中の値をリセット
                    opLabel.current = null;
                }
                else{
                    // 命令スキップを設定
                    opSkip.current = true;
                }
            }
            else if(ifSkip.current || opSkip.current){// スキップ中
                // 処理しない
            }
            else if(line.type === "dialogue"){// セリフ
                if(!cLine){// 最初の行対策
                    // キャラクター表示の計算
                    slots = onCharacterExpression(line, slots);
                    // セリフ音声を再生
                    audioManager.stopVoice();
                    if(line.sound && line.sound !== undefined){
                        audioManager.playVoice(line.sound, newGameData.game.sound.voice);
                    }
                    // 表示する行として登録
                    cLine = {...line, text: parseLineText(line.text)};
                    lastClickSkip.current = false;
                }
                else{
                    // 通常の行の場合は何もせずループ脱出（次のクリック時に処理するため）
                    break;
                }
            }
            else if(line.type === "narration"){// 地の文
                if(!cLine){// 最初の行対策
                    // 表示する行として登録
                    cLine = {...line, text: parseLineText(line.text)};
                    lastClickSkip.current = false;
                }
                else{
                    // 通常の行の場合は何もせずループ脱出（次のクリック時に処理するため）
                    break;
                }
            }
            else if(line.type === "click"){// クリック待ち
                if( lines.isView && i >= (lines.lines.length - 1)){// isView イベント実行完了
                    if( !lastClickSkip.current ){
                        // クリックイベントが連続していない場合は、最後のクリックイベントを処理するためにループ脱出
                        break;
                    } 
                }
                else {
                    // 何もせずループ脱出（次のクリック時に処理）
                    break;
                }
            }
            else if(line.type === "expression"){// 表情変化
                // 立ち絵を再計算
                slots = onCharacterExpression(line, slots);
            }
            else if(line.type === "exit"){// キャラ退場
                // キャラ退場
                slots = exitCharacter(line, slots);
            }
            else if(line.type === "if"){// if開始
                // 実行中のif階層を記憶
                ifDepth.current = line.depth;
                // >< 演算子用に現在のコンテキストのホットスポットを取得
                const currentHotspots = (() => {
                    if (viewItemName) {
                        const item = newGameData.items.find(i => i.name === viewItemName);
                        return item ? item.hotspots : [];
                    }
                    const scene = newGameData.scenes.find(s => s.name === currentSceneName);
                    return scene ? scene.hotspots : [];
                })();
                // 命令スキップするかどうかを判定
                const result = evalCompoundCondition(line.condition, newGameData.variables, currentHotspots);
                ifSkip.current = !result;
                // マッチ状態を記録（else if チェーン用）
                ifMatched.current.set(line.depth, result);
            }
            else if(line.type === "flag"){// フラグ計算
                newGameData.variables = calcFlag(newGameData.variables, line.formula);
            }
            else if(line.type === "getItem"){// アイテム取得
                // アイテムが存在しているかどうかを確認
                const itemIndex = newGameData.items.findIndex((i) => i.name === line.itemName);
                // 存在している場合のみ処理
                if(itemIndex !== -1){
                    const item = newGameData.items[itemIndex];
                    // 取得したアイテム名を登録（アイテムウィンドウを開くため）
                    itemName = item.name;
                    // アイテムを取得状態にする
                    newGameData.items[itemIndex].have = true;
                    // 入手順を記録（未所持のときのみ更新してアイテムボックスの並び順に使う）
                    if(!item.have){
                        newGameData._itemAcquiredCount = (newGameData._itemAcquiredCount ?? 0) + 1;
                        newGameData.items[itemIndex].acquiredOrder = newGameData._itemAcquiredCount;
                    }
                }
            }
            else if(line.type === "discardItem"){// アイテム破棄
                // アイテムが存在しているかどうかを確認
                const itemIndex = newGameData.items.findIndex((i) => i.name === line.itemName);
                // 存在している場合のみ処理
                if(itemIndex !== -1){
                    // アイテムを破棄状態にする
                    newGameData.items[itemIndex].have = false;
                    // 破棄したアイテムが選択中だった場合、選択を解除する
                    selectItem?.(prev => prev === line.itemName ? null : prev);
                }
            }
            else if(line.type === "changeState"){// ステート変更
                // 対象シーンが存在するかどうか確認
                const sceneIndex = newGameData.scenes.findIndex((r) => r.name === line.scene);
                // シーンが存在する場合のみ処理
                if(sceneIndex !== -1){
                    // 変更対象のホットスポットのインデックスを取得
                    const hotspotIndex = newGameData.scenes[sceneIndex].hotspots.findIndex((h) => h.name === line.hotspot);

                    // ホットスポットが存在している場合のみ処理
                    if(hotspotIndex!== - 1){
                        // 対象ステートが存在するか確認
                        const stateIndex = newGameData.scenes[sceneIndex].hotspots[hotspotIndex].states.findIndex(s => s.name === line.state);
                        // ステートが存在している場合のみ処理
                        if(stateIndex !== -1){
                        // ステートを変更
                        newGameData.scenes[sceneIndex].hotspots[hotspotIndex].state = line.state;
                        }
                    }
                
                }
            }
            else if(line.type === "changeStateAll"){// ステート一括変更
                // 対象シーンが存在するかどうか確認
                const sceneIndex = newGameData.scenes.findIndex((r) => r.name === line.scene);
                // シーンが存在する場合のみ処理
                if(sceneIndex !== -1){
                    // すべてのホットスポットでステート変更
                    newGameData.scenes[sceneIndex].hotspots = newGameData.scenes[sceneIndex].hotspots.map((hotspot) => {
                        // 対象ステートが存在するか確認
                        const stateIndex = hotspot.states.findIndex(s => s.name === line.state);
                        // ステートが存在している場合のみ処理
                        if(stateIndex !== -1){
                            // ステートを変更
                            return {...hotspot, state: line.state};
                        }
                        return hotspot;
                    })
                }
            }
            else if(line.type === "changeItemState"){// アイテムステート変更
                // 対象シーンが存在するかどうか確認
                const itemIndex = newGameData.items.findIndex((r) => r.name === line.item);
                // シーンが存在する場合のみ処理
                if(itemIndex !== -1){
                    // 変更対象のホットスポットのインデックスを取得
                    const hotspotIndex = newGameData.items[itemIndex].hotspots.findIndex((h) => h.name === line.hotspot);

                    // ホットスポットが存在している場合のみ処理
                    if(hotspotIndex!== - 1){
                        // 対象ステートが存在するか確認
                        const stateIndex = newGameData.items[itemIndex].hotspots[hotspotIndex].states.findIndex(s => s.name === line.state);
                        // ステートが存在している場合のみ処理
                        if(stateIndex !== -1){
                            // ステートを変更
                            newGameData.items[itemIndex].hotspots[hotspotIndex].state = line.state;
                        }
                    }
                
                }
            }
            else if(line.type === "changeItemStateAll"){// アイテムステート一括変更
                // 対象シーンが存在するかどうか確認
                const itemIndex = newGameData.items.findIndex((r) => r.name === line.item);
                // シーンが存在する場合のみ処理
                if(itemIndex !== -1){
                    // すべてのホットスポットでステート変更
                    newGameData.items[itemIndex].hotspots = newGameData.items[itemIndex].hotspots.map((hotspot) => {
                        // 対象ステートが存在するか確認
                        const stateIndex = hotspot.states.findIndex(s => s.name === line.state);
                        // ステートが存在している場合のみ処理
                        if(stateIndex !== -1){
                            // ステートを変更
                            return {...hotspot, state: line.state};
                        }
                        return hotspot;
                    })
                }
            }
            else if(line.type === "startOption"){// 選択肢開始
                // 実行中のop階層を記憶
                opDepth.current = line.depth;
                break;
            }
            else if(line.type === "afterSO"){// 選択肢開始の次
                break;// クリック待ち
            }
            else if(line.type === "fileJump"){// ファイルジャンプ
                fj = {file: line.file, label: line.label};
                break; // 以降の命令は実行しない
            }
            else if(line.type === "back"){// 背景画像
                // 背景の処理
                if(line.back.startsWith("#")){// 色が指定されている場合
                    cBack.color = line.back;
                    cBack.url = null;
                }
                else if(line.back){// 中身が指定されている場合
                    cBack.color = null;
                    cBack.url = line.back;
                }
                else{// 指定がない場合は解除
                    cBack.color = null;
                    cBack.url = null;
                }
                // アニメーションの処理
                if(line.animation){
                    cBack.animation = line.animation;
                }
                else{
                    cBack.animation = null;
                }
            }
            else if(line.type === "clearBack"){// 背景削除
                cBack.color = null;
                cBack.url = null;
                cBack.animation = line.animation;
            }
            else if(line.type === "image"){// 画像表示
                if(line.url){
                    cImage = line.url;
                }
                else{
                    cImage = null;
                }
            }
            else if(line.type === "clearImage"){
                cImage = null;
            }
            else if(line.type === "hidechar"){// キャラクター非表示
                hChar = true;
            }
            else if(line.type === "showchar"){
                hChar = false;
            }
            else if(line.type === "clearChar"){// キャラクター表示リセット
                slots = [];
            }
            else if(line.type === "clearText"){// テキスト表示リセット
                cLine = {text: null, char: null};
            }
            else if(line.type === "screenEffect"){// 画面エフェクト
                cScreenEffect = { type: line.effect, key: Date.now() };
            }
            else if(line.type === "input"){// 入力フォーム
                break;// クリック待ち
            }
            else if(line.type === "afterInput"){// 入力フォームの次
                break;// クリック待ち
            }
            else if(line.type === "moveScene"){// シーン移動
                ms = line.scene;
            }
            else if(line.type === "sceneBack"){// シーン背景変更
                // 対象シーンが存在するかどうか確認
                const sceneIndex = newGameData.scenes.findIndex((r) => r.name === line.scene);
                // シーンが存在する場合のみ処理
                if(sceneIndex !== -1){
                    newGameData.scenes[sceneIndex].background = line.back;
                }
            }
            else if(line.type === "itemBack"){// アイテム背景変更
                // 対象アイテムが存在するかどうか確認
                const itemIndex = newGameData.items.findIndex((r) => r.name === line.item);
                // アイテムが存在する場合のみ処理
                if(itemIndex !== -1){
                    newGameData.items[itemIndex].image = line.back;
                }
            }
            else if(line.type === "openItemWindow"){
                itemName = line.itemName;
            }
            else if(line.type === "closeItemWindow"){
                itemName = null;
                itemClose = true;
            }
            else if(line.type === "BGM"){// BGMを再生
                audioManager.playBGM(line.url, newGameData.game.sound.bgm);
                bgm.current = line.url;
            }
            else if(line.type === "stopBGM"){// BGMを停止
                audioManager.stopBGM();
                bgm.current = null;
            }
            else if(line.type === "SE"){// SEを再生
                audioManager.playSE(line.url, newGameData.game.sound.se);
            }
            else if(line.type === "random"){// 乱数を変数に格納
                newGameData.variables = random(newGameData.variables, line.varName, line.min, line.max);
            }
            else if(line.type === "hyperlink"){// ハイパーリンク
                openLink(line.url, line.target)
            }
            else if(line.type === "openSave"){// セーブ画面を開く
                openSave();
            }
            else if(line.type === "openLoad"){// ロード画面を開く
                openLoad();
            }
            else if(line.type === "save"){
                const slot = line.slot === "auto" ? "auto" : Number(line.slot);
                saveGame(slot);
            }
            else if(line.type === "load"){
                const slot = line.slot === "auto" ? "auto" : Number(line.slot);
                loadGame(slot);
            }
            else if(line.type === "openConfig"){
                openConfig();
            }
            else if(line.type === "BGMVolume"){
                newGameData.game.sound.bgm = Number(line.volume);
            }
            else if(line.type === "SEVolume"){
                newGameData.game.sound.se = Number(line.volume);
            }
            else if(line.type === "voiceVolume"){
                newGameData.game.sound.voice = Number(line.volume);
            }
            else if(line.type === "textSpeed"){
                newGameData.game.textBox.speed = Number(line.speed);
            }
            else if(line.type === "timer"){
                const fi = newGameData.variables.findIndex(v => v.name === line.varName);
                if(fi !== -1){
                    newGameData.variables[fi].value = line.start;
                    startTimer(line.varName, Number(line.start), Number(line.end), line.file, line.label);
                }
            }
            else if(line.type === "stopTimer"){
                stopTimer(line.varName);
            }
            else if(line.type === "restartTimer"){
                restartTimer(line.varName);
            }
            else if(line.type === "console"){
                console.log(line.command); // 消さない
                // デバッグコンソールにログを送信
                onConsoleLog?.(line.command);
            }
            
            i++;
        }

        // Stateの更新
        if( lines.isView && i >= lines.lines.length ){// isView イベント実行完了
            // #if終了 欠落チェック
            if(ifDepth.current !== 0) console.warn(`[Tojinovel] #if終了 が ${ifDepth.current} 個不足しています`);
            // ゲームデータを更新（念のため）
            updateGameData(() => newGameData);

            // アニメーション付きコマンドが最後にある場合、アニメーション完了を待ってからイベントを終了する
            // ※ 1000ms は index.css の背景アニメーション時間（1s）に合わせたハードコード値
            const animDelay = cBack.animation ? 1000 : 0;

            if (animDelay > 0) {
                // アニメーション完了を待つ間、蓄積した変更を先に反映する
                setCurrentBack(cBack);
                setCurrentLine(cLine);
                setCharacterSlots(slots);
                setCurrentImage(cImage);
                hideCharacter(hChar);
            }

            const finalize = () => {
                // イベント終了時にすべての変数を初期化(BGM除く)
                onComplete?.();
                setIndex(0);

                // イベント開始前にアイテムウィンドウが開いていた場合はそのまま維持する
                if (viewItemNameRef.current === null || viewItemNameRef.current !== viewItemName) {
                    setViewItemName(null);
                }

                setCharacterSlots([]);
                setCurrentLine(null);
                setCurrentOptions(null);
                setCurrentBack({color:null, url:null, animation: null});
                setCurrentImage(null);
                hideCharacter(false);
                setCurrentInput(null);
                setScreenEffect(null);

                ifDepth.current = 0;
                ifSkip.current = false;
                ifMatched.current.clear();
                opDepth.current = 0;
                opSkip.current = false;
                opLabel.current = null;
            };

            if (animDelay > 0) {
                clearTimeout(animEndTimer.current);
                animEndTimer.current = setTimeout(finalize, animDelay);
            } else {
                finalize();
            }
        }
        else{
            if(lines.isView){
                // 表示行の更新
                setCurrentLine(cLine);
                if(cLine !== currentLine){
                    setVisibleCount(0);
                }

                // キャラクタースロットの更新
                setCharacterSlots(slots);

                // 選択肢を表示
                setCurrentOptions(cOptions);
                // 背景を更新
                setCurrentBack(cBack);
                // 表示画像を更新
                setCurrentImage(cImage);
                // キャラ非表示を更新
                hideCharacter(hChar);
                // 入力フォームを表示
                setCurrentInput(cInput);
                // 画面エフェクトを更新
                if (cScreenEffect) setScreenEffect(cScreenEffect);
                // インデックスを更新 バックグラウンドでは不要のため処理しない
                setIndex(i);
            }
            
            // アイテムを取得した場合、アイテム表示
            if (itemClose){
                setViewItemName(null);
            }
            else if(itemName){
                setViewItemName(itemName);
            }
            
            // シーン移動
            if(ms){
                moveScene(ms);
            }

            // ゲームデータを更新
            updateGameData(() => newGameData);

            // ファイルジャンプ
            if(fj){
                clearTimeout(animEndTimer.current); // 前のアニメーションタイマーをクリア
                fileJump(fj.file, fj.label);// ファイルジャンプ

                setCurrentOptions(null);// 選択肢抜ける

                // 条件式の類はすべて初期化
                ifDepth.current = 0;
                ifSkip.current = false;
                ifMatched.current.clear();
                opDepth.current = 0;
                opSkip.current = false;
                opLabel.current = null;

                // バックグラウンドイベントからのジャンプ:
                // fileJumpはjump=trueでexecuteEventを呼ぶため、キューをバイパスして直接実行される。
                // ここでonComplete(finishBackEvent)を呼ぶと、キューから次のイベントが取り出されて
                // fileJumpの結果と競合するため、呼ばない。ジャンプ先の実行完了時にキューが進む。
            }
            else if(!lines.isView && i >= lines.lines.length){ // バックグラウンドイベント実行完了
                // #if終了 欠落チェック
                if(ifDepth.current !== 0) console.warn(`[Tojinovel] #if終了 が ${ifDepth.current} 個不足しています`);

                // アニメーション付きコマンドが最後にある場合、アニメーション完了を待ってからイベントを終了する
                // ※ 1000ms は index.css の背景アニメーション時間（1s）に合わせたハードコード値
                const animDelay = cBack.animation ? 1000 : 0;

                const finalize = () => {
                    onComplete?.();

                    ifDepth.current = 0;
                    ifSkip.current = false;
                    ifMatched.current.clear();
                    opDepth.current = 0;
                    opSkip.current = false;
                    opLabel.current = null;
                };

                if (animDelay > 0) {
                    clearTimeout(animEndTimer.current);
                    animEndTimer.current = setTimeout(finalize, animDelay);
                } else {
                    finalize();
                }
            }
        }
    };

    // effects--------------------------------------------------------------------------------------------------------------------
    // lines が更新されたら、最初の行を実行
    useEffect(() => {
        if (lines && lines?.lines?.length > 0 && index === 0 && !forEdit ) {
            lastClickSkip.current = true;
            viewItemNameRef.current = viewItemName;
            // 最初の行がクリック待ちの場合は自動実行しない（ユーザーのクリックを待つ）
            if (lines.lines[0].type !== "click") {
                handleClick(lines);
            }
        }
    }, [lines]);

    // アンマウント時にアニメーション待ちタイマーをクリア
    useEffect(() => {
        return () => clearTimeout(animEndTimer.current);
    }, []);

    return({
        inputValue,
        getCharacterX,
        choiceOption,
        handleChange,
        commitInput,
        handleClick
    })
}