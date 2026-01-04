import { useEffect, useState, useRef } from "react";

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
  setVisibleCount
}){
    // states------------------------------------------------------------------------------------------
    const [inputValue, setInputValue] = useState("");

    // refs----------------------------------------------------------------------------------------------
    const ifSkip = useRef(false);
    const opSkip = useRef(false);
    
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

        // すでに登場している場合
        if (fi !== -1) {
            const character = characterSlotsBuf[fi];
            // 表情を更新
            characterSlotsBuf[fi] = {...character, nowImage: updateImage(character), lastSpoken: now};
        }
        // 空きスロットがあれば追加する
        else if (characterSlotsBuf.length < gameData.game.character.slots) {
            //キャラクターが定義されているかどうか確認
            const character = gameData.characters.find(c => c.name === line.char);
            if(character){
                // 配列に追加する形で追加
                characterSlotsBuf.push({ ...character, lastSpoken: now, nowImage: updateImage(character) });
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
                characterSlotsBuf[oldestIndex] = ({ ...character, lastSpoken: now, nowImage: updateImage(character) });
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
            characterSlotsBuf.splice(fi, 1); // 削除
            return characterSlotsBuf;
        }
        return slots;
    }

    // 変数・数値・文字列リテラルを判定
    function parseOperand(str, variables) {
        str = str.trim();

        // 数値
        if (!isNaN(Number(str))) {
            return Number(str);
        }

        // 文字列リテラル（"abc" または 'abc'）
        if (/^".*"$/.test(str) || /^'.*'$/.test(str)) {
            return str.slice(1, -1);
        }

        // それ以外は変数名として扱う
        const variable = variables.find((v) => v.name === str);
        if(variable){
            return parseIfNumber(variable.value);
        }

        return str;
    }

    // 条件式パーサー 
    function evalCondition(cond, variables) {
        // 左辺/右辺/演算子に分解
        const regex = /^(.+?)\s*(==|!=|<=|>=|<|>)\s*(.+)$/;

        const match = cond.match(regex);
        if (!match) throw new Error(`不正な条件式: ${cond}`);

        const [, leftRaw, op, rightRaw] = match;
        const leftVal = parseOperand(leftRaw, variables);
        const rightVal = parseOperand(rightRaw, variables);

        switch (op) {
            case "==": return leftVal == rightVal;
            case "!=": return leftVal != rightVal;
            case "<":  return leftVal < rightVal;
            case ">":  return leftVal > rightVal;
            case "<=": return leftVal <= rightVal;
            case ">=": return leftVal >= rightVal;
            default: throw new Error(`未知の演算子: ${op}`);
        }
    }

    // 数値に変換できる場合変換する関数
    function parseIfNumber(value) {
        // 空文字や null, undefined はそのまま返す
        if (value === "" || value == null) return value;

        // 数値として変換できるか確認
        const num = Number(value);

        // NaN でないなら数値と判断
        return isNaN(num) ? value : num;
    }

    // フラグ式パース&実行
    function calcFlag(variables, formula){
        const regex = /^(.+?)\s*(\+|-|=|\*|\/|%)\s*(.+)$/;
        const match = formula.match(regex);
        if (!match) throw new Error(`不正な数式: ${formula}`);

        const [, left, op, rightRaw] = match;
        const rightVal = parseOperand(rightRaw, variables);

        const leftIndex = variables.findIndex(v => v.name === left);
        if(leftIndex !== -1){
            const leftVar = variables[leftIndex];
            const leftVal = parseIfNumber(leftVar.value);
            switch(op){
                case "+":  variables[leftIndex].value = leftVal + rightVal; break;
                case "-": variables[leftIndex].value = leftVal - rightVal; break;
                case "*": variables[leftIndex].value = leftVal * rightVal; break;
                case "/": variables[leftIndex].value = Math.floor(leftVal / rightVal); break;
                case "%": variables[leftIndex].value = leftVal % rightVal; break;
                case "=": variables[leftIndex].value = rightVal; break;
            }
        }
        else if(op === "="){// 無い場合は変数を追加する（テキストでも変数定義可能）
            variables.push({name: left, value: rightVal});
        }
        
        return variables;
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

    // 乱数を返す関数
    const randomInt = (min, max) => {
        // 両端含む整数 [min, max]
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 変数に乱数を格納
    const random = (variables, varName, min, max) => {
        // 数値化（NaNの場合も考慮してデフォルト値を設定）
        const minNum = Number(min);
        const maxNum = Number(max);

        // 無効な値だった場合のフォールバック（例: min > max や NaN）
        const safeMin = isNaN(minNum) ? 0 : minNum;
        const safeMax = isNaN(maxNum) ? safeMin + 1 : Math.max(safeMin, maxNum);

        const index = variables.findIndex(v => v.name === varName);
        if (index !== -1) {
            variables[index].value = randomInt(safeMin, safeMax);
        }
        return variables;
    };

    function openLink(url, target = "_blank") {
        if (!url) return;
        const safeTarget = target || "_blank";
        window.open(url, safeTarget, "noopener,noreferrer");
    }

    /* 変数を展開 */
    const expandVars = (str, vars) => {
        return str.replace(/\[([^\]]+)\]/g, (_, name) => {
            const variable = vars.find(v => v.name === name);
            return variable ? variable.value : `[${name}]`;
        });
    }

    function expandVarsShallow(block, vars) {
        const result = {};

        for (const key in block) {
        const value = block[key];

        if (typeof value === "string") {
            // 値が文字列なら直接展開
            result[key] = expandVars(value, vars);
        } 
        else if (Array.isArray(value)) {
            // 1次元配列の場合 → 各要素が文字列である前提なので展開
            result[key] = value.map(s => expandVars(s, vars));
        }
        else {
            // 文字列でも配列でもない → そのまま（基本このケースは無い）
            result[key] = value;
        }
        }

        return result;
    }

    // 文を1文字ずつに解体
    const parseLineText = (text) => {
        let highlight = false;

        let result = [];

        for (const ch of text) {
        if(ch === '\"'){
            highlight = !highlight; // 反転
        }
        else{
            result.push({char: ch, highlight: highlight});
        }
        }

        return result;
    }

    // クリック時処理
    const handleClick = (lines) => {
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

        /* 現在の行の処理（クリック待ち要素） */
        if(nLine.type === "dialogue"){ // セリフ
            slots = onCharacterExpression(nLine, slots);
            // セリフ音声を再生
            audioManager.stopVoice();
            if(nLine.sound && nLine.sound !== undefined){
                audioManager.playVoice(nLine.sound, newGameData.game.sound.voice);
            }
            cLine = {...nLine, text: parseLineText(nLine.text)};
            i++;
        }
        else if(nLine.type === "narration"){ // 地の文
            cLine = {...nLine, text: parseLineText(nLine.text)};
            i++;
        }
        else if(nLine.type === "click"){ //クリック要素
            i++;
        }
        else if(nLine.type === "startOption"){//選択肢開始
            cOptions = nLine.options;
            opSkip.current = false;
            i++;
        }
        else if(nLine.type === "afterSO"){//選択肢開始の直後
            opSkip.current = true;// 選択肢出現前の文は無視
            // 次のセリフ・地の文を強制実行
            cLine = null;
            i++;
        }
        else if(nLine.type === "input"){// 入力フォーム表示
            cInput = nLine.varName;
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
            i++;
        }

        /* クリック待ち命令実行後の式の評価 */
        while(i < lines.lines.length){
            const line = expandVarsShallow(lines.lines[i], newGameData.variables); // 処理する行
            
            if((line.type === "endif") && (line.depth === ifDepth.current)){ // if終了時
                // if階層を1つ上げる
                ifDepth.current = Math.max(ifDepth.current - 1, 0);
                // ifによる命令スキップを解除
                ifSkip.current = false;
            }
            else if((line.type === "else") && (line.depth === ifDepth.current)){ // else登場時
                // ifによる命令スキップを反転
                ifSkip.current = !ifSkip.current;
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
                }
                else{
                    // 通常の行の場合は何もせずループ脱出（次のクリック時に処理するため）
                    break;
                }
            }
            else if(line.type === "click"){// クリック待ち
                // クリック待ち
                // 何もせずループ脱出（次のクリック時に処理するため）
                break;
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
                // 命令スキップするかどうかを判定
                ifSkip.current = !evalCondition(line.condition, newGameData.variables);
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
                }
            }
            else if(line.type === "discardItem"){// アイテム破棄
                // アイテムが存在しているかどうかを確認
                const itemIndex = newGameData.items.findIndex((i) => i.name === line.itemName);
                // 存在している場合のみ処理
                if(itemIndex !== -1){
                // アイテムを破棄状態にする
                    newGameData.items[itemIndex].have = false;
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
                        const stateIndex = newGameData.scenes[sceneIndex].hotspots[hotspotIndex].states.find(s => s.name === line.state);
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
                        const stateIndex = newGameData.items[itemIndex].hotspots[hotspotIndex].states.find(s => s.name === line.state);
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
            }
            
            i++;
        }

        // Stateの更新
        if( lines.isView && i >= lines.lines.length ){// isView イベント実行完了
            // イベント終了時にすべての変数を初期化(BGM除く)
            onComplete?.();
            setIndex(0);
            setViewItemName(null);
            
            setCharacterSlots([]);
            setCurrentLine(null);
            setCurrentOptions(null);
            setCurrentBack({color:null, url:null, animation: null});
            setCurrentImage(null);
            hideCharacter(false);
            setCurrentInput(null);

            ifDepth.current = 0;
            ifSkip.current = false;
            opDepth.current = 0;
            opSkip.current = false;
            opLabel.current = null;
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
            updateGameData(prev => newGameData);

            // ファイルジャンプ
            if(fj){
                fileJump(fj.file, fj.label);// ファイルジャンプ

                setCurrentOptions(null);// 選択肢抜ける

                // 条件式の類はすべて初期化
                ifDepth.current = 0;
                ifSkip.current = false;
                opDepth.current = 0;
                opSkip.current = false;
                opLabel.current = null;
            }
            else if(!lines.isView && i >= lines.lines.length){ // バックグラウンドイベント実行完了
                onComplete?.();
                
                ifDepth.current = 0;
                ifSkip.current = false;
                opDepth.current = 0;
                opSkip.current = false;
                opLabel.current = null;
            }
        }
    };

    // effects--------------------------------------------------------------------------------------------------------------------
    // lines が更新されたら、最初の行を実行
    useEffect(() => {
        if (lines && lines?.lines?.length > 0 && index === 0 && !forEdit ) {
            handleClick(lines);
        }
    }, [lines]);


    return({
        inputValue,
        getCharacterX,
        choiceOption,
        handleChange,
        commitInput,
        handleClick
    })
}