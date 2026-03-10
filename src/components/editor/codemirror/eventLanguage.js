// イベントファイル（.txt）用のCodeMirror言語定義
import { StreamLanguage } from "@codemirror/language";

// トークンタイプ: CodeMirrorのスタイルにマッピング
// - keyword: #コマンド
// - labelName: 【ラベル】
// - string: 「セリフ」
// - variableName: [変数名]
// - comment: // コメント
// - typeName: キャラ名（表情）
// - operator: 演算子
// - controlKeyword: #if, #else, #if終了, #選択肢等

const eventLanguage = StreamLanguage.define({
  name: "tojinovel-event",

  startState() {
    return {
      inString: false,      // 「」内
      inMultiLine: false,   // 複数行セリフ中
    };
  },

  token(stream, state) {
    // 複数行セリフの継続
    if (state.inMultiLine) {
      if (stream.match(/.*?」/)) {
        state.inMultiLine = false;
        return "string";
      }
      stream.skipToEnd();
      return "string";
    }

    // 行頭の空白をスキップ
    if (stream.sol() && stream.eatSpace()) {
      return null;
    }

    // コメント: // で始まる行
    if (stream.match(/\/\/.*/)) {
      return "comment";
    }

    // ラベル: 【ラベル名】
    if (stream.match(/【[^】]*】/)) {
      return "labelName";
    }

    // 制御構文: #if, #else if, #else, #if終了/#endif, #選択肢/#option, #選択肢終了/#endOption
    if (stream.match(/#endif|#if終了|#if:|#else if:|#else|#endOption|#選択肢終了|#option|#選択肢/)) {
      return "controlKeyword";
    }

    // コマンド: # で始まる行（#外部関数:/#externalFunc: も含む）
    if (stream.match(/#[^:\s]+:/)) {
      return "keyword";
    }
    if (stream.match(/#[^\s:]+(?=\s|$)/)) {
      return "keyword";
    }

    // 変数展開: [変数名]
    if (stream.match(/\[[^\]]+\]/)) {
      return "variableName";
    }

    // 強調: "テキスト"
    if (stream.match(/"[^"]*"/)) {
      return "strong";
    }

    // セリフ: 「テキスト」（複数行対応）
    if (stream.match(/「/)) {
      if (stream.match(/[^」]*」/)) {
        return "string";
      }
      // 閉じカッコがない場合は複数行
      stream.skipToEnd();
      state.inMultiLine = true;
      return "string";
    }

    // キャラクター表情: キャラ名（表情名）
    if (stream.match(/[^\s「」（）【】[\]#/]+（[^）]*）/)) {
      return "typeName";
    }

    // 選択肢項目: ・で始まる行
    if (stream.sol() && stream.match(/\s*・/)) {
      return "labelName";
    }

    // その他の文字
    stream.next();
    return null;
  },

  languageData: {
    commentTokens: { line: "//" },
  },
});

export default eventLanguage;
