
export async function loadEventLines(url, startLabel, characters) {
  try {
    const response = await fetch(url);

    // 1. HTTP エラー時
    if (!response.ok) return null;

    // 2. Content-Type がテキストでない場合は null
    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.startsWith("text/")) {
      return null;
    }

    // 3. テキスト取得
    const text = await response.text();

    // 4. パースして返す
    return parseEventText(text, startLabel, characters);

  } catch (e) {
    // fetch の例外（ネットワークエラーなど）
    return null;
  }
}

/* 相対パスを./から始まる相対パスに変換 */
function normalizeRelativeUrl(path) {
  if (!path) return path;

  const trimmed = path.trim();

  // 絶対URL（http, https, //）はそのまま
  if (/^(https?:)?\/\//.test(trimmed)) {
    return trimmed;
  }

  // カラーコードはそのまま
  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  // すでに ./ で始まっている場合
  if (trimmed.startsWith("./")) {
    return trimmed;
  }

  // / で始まっている相対パス
  if (trimmed.startsWith("/")) {
    return "." + trimmed;
  }

  // それ以外（foo.png, dir/foo.png, ../foo.png など）
  return "./" + trimmed;
}



/**
 * txt を EventViewer 用の配列に変換
 */
function parseEventText(text, label, characters) {
  const lines = text.split("\n");// 改行で分割
  const blocks = [];// 最終的な出力
  let buffer = "";// 改行をまたぐ命令を結合するバッファ
  let start = (label && label !== undefined) ? false : true;// 読み込み開始（ラベルがない場合ファイル冒頭から）
  let depth = 0;// if階層
  let opDepth = 0;// 選択肢階層
  let isView = false; // 表示イベントを含んでいるかどうか

  // 命令の解釈
  for (let line of lines) {// 1行ずつ処理
    line = line.trim();

    // 空行スキップ
    if (!line) continue;

    // コメントスキップ
    if (line.startsWith("//")) continue;

    // 開始ラベル発見
    if (!start) {
      if (line === "【" + label + "】"){
        start = true;
      }
      continue;
    }

    // 開始ラベル以外のラベル発見（=終了）
    if (line.match(/^【(.*?)】$/)) {
      start = false;
      continue;
    }

    // コマンドの場合
    if (line.startsWith("#")) {
      // #を除去
      const command = line.slice(1);
      switch (true) {
        case command === "クリック待ち":// クリック待ち
          blocks.push({ type: "click" });
          isView = true;
          break;

        case command.startsWith("if:"):// if開始
          // 階層を加算
          depth++;
          // 式と階層を登録
          blocks.push({ type: "if", condition: command.replace("if:", "").trim(), depth: depth });
          break;

        case command.startsWith("else"):// else
          // 階層を登録
          blocks.push({ type: "else", depth: depth });
          break;

        case command === "if終了":// if終了
          blocks.push({ type: "endif", depth: depth });
          depth--;
          break;

        case command.startsWith("フラグ:"):// フラグ計算
          // 計算式を登録
          blocks.push({ type: "flag", formula: command.replace("フラグ:", "").trim() });
          break;

        case command.startsWith("アイテム入手:"):// アイテム入手
          // アイテム名を登録
          blocks.push({ type: "getItem", itemName: command.replace("アイテム入手:", "").trim() });
          break;

        case command.startsWith("アイテム破棄:"):// アイテム破棄
          // アイテム名を登録
          blocks.push({ type: "discardItem", itemName: command.replace("アイテム破棄:", "").trim() });
          break;

        case command.startsWith("ステート変更:"):// ステート変更
          const match = command.match(/^ステート変更:(.*?),(.*?),(.*?)$/);
          if (match) {
            // シーン名、ホットスポット名、ステート名を登録
            blocks.push({ type: "changeState", scene: match[1].trim(), hotspot: match[2].trim(), state: match[3].trim() });
          }
          break;

        case command.startsWith("ステート一括変更:"):// ステート変更
          const match2 = command.match(/^ステート一括変更:(.*?),(.*?)$/);
          if (match2) {
            // シーン名、ホットスポット名、ステート名を登録
            blocks.push({ type: "changeStateAll", scene: match2[1].trim(), state: match2[2].trim() });
          }
          break;

        case command.startsWith("アイテムステート変更:"):// ステート変更
          const match9 = command.match(/^アイテムステート変更:(.*?),(.*?),(.*?)$/);
          if (match9) {
            // シーン名、ホットスポット名、ステート名を登録
            blocks.push({ type: "changeItemState", item: match9[1].trim(), hotspot: match9[2].trim(), state: match9[3].trim() });
          }
          break;

        case command.startsWith("アイテムステート一括変更:"):// ステート変更
          const match10 = command.match(/^アイテムステート一括変更:(.*?),(.*?)$/);
          if (match10) {
            // シーン名、ホットスポット名、ステート名を登録
            blocks.push({ type: "changeItemStateAll", item: match10[1].trim(), state: match10[2].trim() });
          }
          break;

        case (command === "選択肢" || command === "選択肢:"):// 選択肢
          opDepth++;
          isView = true;
          blocks.push({type: "startOption", depth: opDepth, options: []});
          // 選択肢選択後にクリックイベントを用いるため、クリック待ちを挿入
          blocks.push({ type: "afterSO" });
          break;

        case command === "選択肢終了": // 選択肢終了
          blocks.push({type: "endOption", depth: opDepth});
          opDepth--;
          break;

        case command.startsWith("ファイルジャンプ:"):// ファイルジャンプ（=終了）
          const [file, label] = command.replace("ファイルジャンプ:","").split(",");
          if(isView){
            blocks.push({ type: "click" });// クリック待ち実行後にファイルジャンプ
          }
          blocks.push({type: "fileJump", file: file.trim(), label: label.trim()});
          //start = false;
          break;

        case command.startsWith("背景:"): //背景変更
          isView = true;
          const [back, animation] = command.replace("背景:","").split(",");
          blocks.push({type: "back", back: normalizeRelativeUrl(back?.trim()), animation: animation?.trim()});
          break;

        case command.startsWith("背景クリア"):
          isView = true;
          blocks.push({type: "clearBack", animation: command === "背景クリア" ? null : command.replace("背景クリア:","").trim()});
          break;

        case command.startsWith("画像:"): //画像表示
          isView = true;
          blocks.push({type: "image", url: normalizeRelativeUrl(command.replace("画像:","").trim())});
          break;

        case command === "画像クリア":
          isView = true;
          blocks.push({type: "clearImage"});
          break;

        case command === "キャラ非表示": // キャラクターを非表示にする
          isView = true;
          blocks.push({type: "hidechar"});
          break;

        case command === "キャラ非表示解除":// キャラ非表示を解除する
          isView = true;
          blocks.push({type: "showchar"});
          break;

        case command === "キャラクリア": // 立ち絵をクリアする
          isView = true;
          blocks.push({type: "clearChar"});
          break;

        case command === "テキストクリア": // テキストをクリアする
          isView = true;
          blocks.push({type: "clearText"});
          break;

        case command.startsWith("入力:"):// 入力フォーム
          isView = true;
          blocks.push({type: "input", varName: command.replace("入力:", "").trim()});
          // 選択肢選択後にクリックイベントを用いるため、クリック待ちを挿入
          blocks.push({type: "afterInput"});
          break;

        case command.startsWith("シーン移動:")://シーン移動
          blocks.push({type: "moveScene", scene: command.replace("シーン移動:","").trim()});
          break;

        case command.startsWith("シーン背景変更:"): //シーン背景変更
          const match3 = command.match(/^シーン背景変更:(.*?),(.*?)$/);
          blocks.push({type: "sceneBack", scene: match3[1].trim(), back: normalizeRelativeUrl(match3[2].trim())});
          break;

        case command.startsWith("アイテム背景変更:"): //アイテム背景変更
          const match4 = command.match(/^アイテム背景変更:(.*?),(.*?)$/);
          blocks.push({type: "itemBack", item: match4[1].trim(), back: normalizeRelativeUrl(match4[2].trim())});
          break;

        case command.startsWith("アイテム画面:"):
          blocks.push({type: "openItemWindow", itemName: command.replace("アイテム画面:","")});
          break;

        case command === "アイテム画面閉じる":
          blocks.push({type: "closeItemWindow"});
          break;

        case command.startsWith("BGM:"):
          blocks.push({type: "BGM", url: normalizeRelativeUrl(command.replace("BGM:", "").trim())});
          break;

        case command === "BGM停止":
          blocks.push({type: "stopBGM"});
          break;

        case command.startsWith("SE:"):
          const se = command.replace("SE:", "");
          blocks.push({type: "SE", url: normalizeRelativeUrl(se.trim())});
          break;

        case command.startsWith("乱数:"):
          const match5 = command.match(/^乱数:(.*?),(.*?),(.*?)$/);
          blocks.push({type: "random", varName: match5[1].trim(), min: match5[2].trim(), max: match5[3].trim()});
          break;

        case command.startsWith("ハイパーリンク:"):
          const match6 = command.match(/^ハイパーリンク:(.*?),(.*?)$/);
          if(match6){
            blocks.push({type: "hyperlink", url: normalizeRelativeUrl(match6[1].trim()), target: match6[2].trim()});
          }
          else{
            blocks.push({type: "hyperlink", url: normalizeRelativeUrl(command.replace("ハイパーリンク:", "").trim()), target: null});
          }
          break;
        
        case command === "セーブ画面":
          blocks.push({type: "openSave"});
          break;
        
        case command === "ロード画面":
          blocks.push({type: "openLoad"});
          break;

        case command.startsWith("セーブ:"):
          blocks.push({type: "save", slot: command.replace("セーブ:", "").trim()});
          break;

        case command.startsWith("ロード:"):
          blocks.push({type: "load", slot: command.replace("ロード:", "").trim()});
          break;

        case command === "コンフィグ画面":
          blocks.push({type: "openConfig"});
          break;

        case command.startsWith("BGM音量:"):
          blocks.push({type: "BGMVolume", volume: command.replace("BGM音量:", "").trim()});
          break;

        case command.startsWith("SE音量:"):
          blocks.push({type: "SEVolume", volume: command.replace("SE音量:", "").trim()});
          break;

        case command.startsWith("ボイス音量:"):
          blocks.push({type: "voiceVolume", volume: command.replace("ボイス音量:", "").trim()});
          break;

        case command.startsWith("文字送り速度:"):
          blocks.push({type: "textSpeed", speed: command.replace("文字送り速度:", "").trim()});
          break;

        case command.startsWith("タイマー:"):
          const match7 = command.match(/^タイマー:(.*?),(.*?),(.*?),(.*?),(.*?)$/);
          if(match7){
            blocks.push({type: "timer", varName: match7[1].trim(), start: match7[2].trim(), end: match7[3].trim(), file: match7[4].trim(), label: match7[5].trim()});
          }
          else{
            const match8 = command.match(/^タイマー:(.*?),(.*?),(.*?)$/);
            if(match8){
              blocks.push({type: "timer", varName: match8[1].trim(), start: match8[2].trim(), end: match8[3].trim()});
            }
          }
          break;

        case command.startsWith("タイマー一時停止:"):
          blocks.push({type: "stopTimer", varName: command.replace("タイマー一時停止:", "").trim()});
          break;

        case command.startsWith("タイマー再開:"):
          blocks.push({type: "restartTimer", varName: command.replace("タイマー再開:", "").trim()});
          break;

        case command.startsWith("コンソール:"):
          blocks.push({type: "console", command: command.replace("コンソール:", "").trim()});
          break;
      }
      continue;
    }

    // 選択肢の項目
    if(line.startsWith("・")){
      // 現在の選択肢の深さで、最後に登場する選択肢開始を捜索（親に選択肢を追加する）
      const optionStartBlock = blocks.findLast(b => (b.type === "startOption") && (b.depth === opDepth));

      // 選択肢が存在しない場合はスキップ
      if(optionStartBlock){
        const option = line.replace("・", "").trim();
        // 親に選択肢を追加
        optionStartBlock.options.push(option);
        blocks.push({type: "option", depth: opDepth, option: option});
      }
      continue;
    }

    // セリフ・地の文・表情などの処理
    if (buffer || line.includes("「")) {// セリフかどうか判定
      // バッファに追加
      buffer += (buffer ? "\n" : "") + line;

      isView = true;

      // セリフ終了
      if (line.includes("」")) {
        // 名前・表情、セリフ、補足に分解
        const match = buffer.match(/^(.*?)「([\s\S]+)」(.*?)$/);

        // デフォルトの声量（文字サイズ）
        let volume = "normal";

        if (match) {// 分解できた場合
          let text = match[2];// セリフ

          // 大声・小声の処理
          if (text.endsWith("（大声）") || text.endsWith("(大声)")) {
            volume = "big";
            text = text.slice(0, -4);
          }
          else if (text.endsWith("（小声）") || text.endsWith("(小声)")) {
            volume = "small";
            text = text.slice(0, -4);
          }

          // 名前と表情に分割
          let match2 = match[1].match(/^(.*?)（(.+?)）$/);
          if(!match2){
            // 半角括弧も許容
            match2 = match[1].match(/^(.*?)\((.+?)\)$/);
          }

          // 名前・表情がある場合
          if (match2) {
            // 名前、表情、本文を登録
            blocks.push({ type: "dialogue", char: match2[1], expression: match2[2], text, volume, sound: normalizeRelativeUrl(match[3]?.trim()) });
          }
          else {
            // ない場合はすべて名前として解釈
            blocks.push({ type: "dialogue", char: match[1], text, volume, sound: normalizeRelativeUrl(match[3]?.trim()) });
          }
        }
        else {// 分解できなかった場合
          // 全体をセリフとして登録
          blocks.push({ type: "dialogue", char: null, text: buffer, volume, sound: normalizeRelativeUrl(match[3]?.trim()) });
        }
        buffer = "";
      }
    }
    else {
      // セリフではない場合
      // カッコ内の命令があるかどうか確認
      let match = line.match(/^(.*?)（(.*?)）$/);
      if(!match){
        // 半角の括弧も許容
        match = line.match(/^(.*?)\((.*?)\)$/);
      }

      // 命令がある場合
      if (match && characters.find(s => s.name === match[1])) {

        // 退場命令の場合
        if (match[2] === "退場"){
          blocks.push({ type: "exit", char: match[1] });
        }
        else{
          // それ以外は表情変化の命令として解釈
          isView = true;
          blocks.push({ type: "expression", char: match[1], expression: match[2] });
        }
      }
      else {
        // 無い場合は地の文として解釈
        isView = true;
        blocks.push({ type: "narration", text: line });
      }
    }
  }

  // 出力に追加
  if (buffer) blocks.push(buffer);

  // イベントが存在する場合
  if(blocks.length > 0){
    // 最後にクリックイベントを追加
    if(isView){
      blocks.push({ type: "click" });
    }
    return {lines: blocks, isView};
  }

  // イベントがない場合はnullを返す（イベントを実行しない）
  return null;
}
