// イベントファイル用のコマンド自動補完
import { autocompletion } from "@codemirror/autocomplete";

// 拡張子フィルタ
const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|svg)$/i;
const AUDIO_EXTS = /\.(mp3|ogg|wav|m4a)$/i;
const TEXT_EXTS = /\.txt$/i;

// コマンド一覧（wiki/05-event-reference.md ベース）
// 各コマンドに日本語版と英語エイリアス版の両方を登録
const commands = [
  // 基本制御
  { label: "#クリック待ち", type: "keyword", info: "プレイヤーのクリックを待つ" },
  { label: "#click", type: "keyword", info: "プレイヤーのクリックを待つ" },
  { label: "#ファイルジャンプ: ", type: "keyword", info: "ファイル名, ラベル名", detail: "別ファイルにジャンプ" },
  { label: "#fileJump: ", type: "keyword", info: "ファイル名, ラベル名", detail: "別ファイルにジャンプ" },

  // 条件分岐
  { label: "#if: ", type: "keyword", info: "変数名 演算子 値", detail: "条件分岐開始" },
  { label: "#else if: ", type: "keyword", info: "変数名 演算子 値", detail: "条件分岐（追加条件）" },
  { label: "#else", type: "keyword", info: "条件が偽の場合の処理" },
  { label: "#if終了", type: "keyword", info: "条件分岐終了" },
  { label: "#endif", type: "keyword", info: "条件分岐終了" },

  // フラグ操作
  { label: "#フラグ: ", type: "keyword", info: "変数名 演算子 値", detail: "変数を操作" },
  { label: "#flag: ", type: "keyword", info: "変数名 演算子 値", detail: "変数を操作" },
  { label: "#乱数: ", type: "keyword", info: "変数名, 最小値, 最大値", detail: "乱数を生成" },
  { label: "#random: ", type: "keyword", info: "変数名, 最小値, 最大値", detail: "乱数を生成" },

  // キャラクター
  { label: "#キャラ非表示", type: "keyword", info: "全キャラの立ち絵を非表示" },
  { label: "#hideChar", type: "keyword", info: "全キャラの立ち絵を非表示" },
  { label: "#キャラ非表示解除", type: "keyword", info: "立ち絵の非表示を解除" },
  { label: "#showChar", type: "keyword", info: "立ち絵の非表示を解除" },
  { label: "#キャラクリア", type: "keyword", info: "全キャラを退場" },
  { label: "#clearChar", type: "keyword", info: "全キャラを退場" },
  { label: "#テキストクリア", type: "keyword", info: "テキストを消去" },
  { label: "#clearText", type: "keyword", info: "テキストを消去" },

  // シーン
  { label: "#シーン移動: ", type: "keyword", info: "シーン名", detail: "シーンを移動" },
  { label: "#moveScene: ", type: "keyword", info: "シーン名", detail: "シーンを移動" },
  { label: "#シーン背景変更: ", type: "keyword", info: "シーン名, 背景画像URL" },
  { label: "#sceneBg: ", type: "keyword", info: "シーン名, 背景画像URL" },
  { label: "#ステート変更: ", type: "keyword", info: "シーン名, ホットスポット名, ステート名" },
  { label: "#changeState: ", type: "keyword", info: "シーン名, ホットスポット名, ステート名" },
  { label: "#ステート一括変更: ", type: "keyword", info: "シーン名, ステート名" },
  { label: "#changeStateAll: ", type: "keyword", info: "シーン名, ステート名" },

  // アイテム
  { label: "#アイテム入手: ", type: "keyword", info: "アイテム名", detail: "アイテムを入手" },
  { label: "#getItem: ", type: "keyword", info: "アイテム名", detail: "アイテムを入手" },
  { label: "#アイテム破棄: ", type: "keyword", info: "アイテム名", detail: "アイテムを破棄" },
  { label: "#discardItem: ", type: "keyword", info: "アイテム名", detail: "アイテムを破棄" },
  { label: "#アイテム背景変更: ", type: "keyword", info: "アイテム名, 背景画像URL" },
  { label: "#itemBg: ", type: "keyword", info: "アイテム名, 背景画像URL" },
  { label: "#アイテムステート変更: ", type: "keyword", info: "アイテム名, ホットスポット名, ステート名" },
  { label: "#changeItemState: ", type: "keyword", info: "アイテム名, ホットスポット名, ステート名" },
  { label: "#アイテムステート一括変更: ", type: "keyword", info: "アイテム名, ステート名" },
  { label: "#changeItemStateAll: ", type: "keyword", info: "アイテム名, ステート名" },
  { label: "#アイテム画面: ", type: "keyword", info: "アイテム名", detail: "アイテム詳細を開く" },
  { label: "#openItem: ", type: "keyword", info: "アイテム名", detail: "アイテム詳細を開く" },
  { label: "#アイテム画面閉じる", type: "keyword", info: "アイテム詳細を閉じる" },
  { label: "#closeItem", type: "keyword", info: "アイテム詳細を閉じる" },

  // 背景・画像
  { label: "#背景: ", type: "keyword", info: "画像URL または HEXカラー, アニメーション名" },
  { label: "#bg: ", type: "keyword", info: "画像URL または HEXカラー, アニメーション名" },
  { label: "#背景クリア", type: "keyword", info: "背景を削除" },
  { label: "#clearBg", type: "keyword", info: "背景を削除" },
  { label: "#画像: ", type: "keyword", info: "画像URL", detail: "画像を表示" },
  { label: "#image: ", type: "keyword", info: "画像URL", detail: "画像を表示" },
  { label: "#画像クリア", type: "keyword", info: "画像を削除" },
  { label: "#clearImage", type: "keyword", info: "画像を削除" },

  // 選択肢・入力
  { label: "#選択肢", type: "keyword", info: "選択肢ブロック開始" },
  { label: "#option", type: "keyword", info: "選択肢ブロック開始" },
  { label: "#選択肢終了", type: "keyword", info: "選択肢ブロック終了" },
  { label: "#endOption", type: "keyword", info: "選択肢ブロック終了" },
  { label: "#入力: ", type: "keyword", info: "変数名", detail: "入力フォームを表示" },
  { label: "#input: ", type: "keyword", info: "変数名", detail: "入力フォームを表示" },

  // 音声
  { label: "#BGM: ", type: "keyword", info: "音声ファイルURL", detail: "BGMを再生" },
  { label: "#BGM停止", type: "keyword", info: "BGMを停止" },
  { label: "#stopBGM", type: "keyword", info: "BGMを停止" },
  { label: "#SE: ", type: "keyword", info: "音声ファイルURL", detail: "SEを再生" },
  { label: "#BGM音量: ", type: "keyword", info: "数値（0-100）" },
  { label: "#bgmVolume: ", type: "keyword", info: "数値（0-100）" },
  { label: "#SE音量: ", type: "keyword", info: "数値（0-100）" },
  { label: "#seVolume: ", type: "keyword", info: "数値（0-100）" },
  { label: "#ボイス音量: ", type: "keyword", info: "数値（0-100）" },
  { label: "#voiceVolume: ", type: "keyword", info: "数値（0-100）" },

  // リンク
  { label: "#ハイパーリンク: ", type: "keyword", info: "URL, ターゲット" },
  { label: "#hyperlink: ", type: "keyword", info: "URL, ターゲット" },

  // セーブ・ロード
  { label: "#セーブ画面", type: "keyword", info: "セーブ画面を開く" },
  { label: "#openSave", type: "keyword", info: "セーブ画面を開く" },
  { label: "#ロード画面", type: "keyword", info: "ロード画面を開く" },
  { label: "#openLoad", type: "keyword", info: "ロード画面を開く" },
  { label: "#セーブ: ", type: "keyword", info: "スロット番号", detail: "指定スロットにセーブ" },
  { label: "#save: ", type: "keyword", info: "スロット番号", detail: "指定スロットにセーブ" },
  { label: "#ロード: ", type: "keyword", info: "スロット番号", detail: "指定スロットからロード" },
  { label: "#load: ", type: "keyword", info: "スロット番号", detail: "指定スロットからロード" },
  { label: "#コンフィグ画面", type: "keyword", info: "コンフィグ画面を開く" },
  { label: "#openConfig", type: "keyword", info: "コンフィグ画面を開く" },
  { label: "#文字送り速度: ", type: "keyword", info: "数値（ms）" },
  { label: "#textSpeed: ", type: "keyword", info: "数値（ms）" },

  // タイマー
  { label: "#タイマー: ", type: "keyword", info: "変数名, 開始値, 終了値[, ファイル, ラベル]" },
  { label: "#timer: ", type: "keyword", info: "変数名, 開始値, 終了値[, ファイル, ラベル]" },
  { label: "#タイマー一時停止: ", type: "keyword", info: "変数名" },
  { label: "#pauseTimer: ", type: "keyword", info: "変数名" },
  { label: "#タイマー再開: ", type: "keyword", info: "変数名" },
  { label: "#resumeTimer: ", type: "keyword", info: "変数名" },

  // デバッグ
  { label: "#コンソール: ", type: "keyword", info: "出力内容", detail: "デバッグ出力" },
  { label: "#console: ", type: "keyword", info: "出力内容", detail: "デバッグ出力" },
];

// 自動補完関数
function eventCompletions(context) {
  // # の後にカーソルがあるか確認
  const word = context.matchBefore(/#[^\s]*/);
  if (!word) return null;

  // # だけの場合、または # に続く文字列がある場合に補完
  if (word.from === word.to && !context.explicit) return null;

  return {
    from: word.from,
    options: commands,
    validFor: /^#[^\s]*$/,
  };
}

// パスを引数に取るコマンド定義
// 第1引数がパスのコマンド
const PATH_FIRST_CMDS = /^#(背景|bg|画像|image|BGM|SE|ファイルジャンプ|fileJump):/;
// 第2引数がパスのコマンド（シーン名, パス の形式）
const PATH_SECOND_CMDS = /^#(シーン背景変更|sceneBg|アイテム背景変更|itemBg|タイマー|timer):/;

// 第1引数がシーン名のコマンド
const SCENE_FIRST_CMDS = /^#(シーン移動|moveScene|シーン背景変更|sceneBg|ステート変更|changeState|ステート一括変更|changeStateAll):/;
// 第1引数がアイテム名のコマンド
const ITEM_FIRST_CMDS = /^#(アイテム入手|getItem|アイテム破棄|discardItem|アイテム背景変更|itemBg|アイテムステート変更|changeItemState|アイテムステート一括変更|changeItemStateAll|アイテム画面|openItem):/;

// コマンド種別に応じた拡張子フィルタを返す
function getExtFilter(cmd) {
  if (cmd === "BGM" || cmd === "SE") return AUDIO_EXTS;
  if (cmd === "ファイルジャンプ" || cmd === "fileJump") return TEXT_EXTS;
  if (cmd === "タイマー" || cmd === "timer") return TEXT_EXTS;
  return IMAGE_EXTS;
}

// ファイルパス補完ソース（fileListRef経由でファイル一覧を参照）
function createPathCompletionSource(fileListRef, ensureLoaded) {
  return (context) => {
    const line = context.state.doc.lineAt(context.pos);
    const textBefore = line.text.slice(0, context.pos - line.from);

    let cmd = null;
    let partial = "";

    // 第1引数がパス: "#cmd: partial"
    const m1 = textBefore.match(/^#([^\s:]+):\s+(.*)$/);
    if (m1 && PATH_FIRST_CMDS.test(`#${m1[1]}:`)) {
      cmd = m1[1];
      partial = m1[2];
    }

    // 第2引数がパス: "#cmd: arg1, partial"
    if (!cmd) {
      const m2 = textBefore.match(/^#([^\s:]+):\s+[^,]+,\s+(.*)$/);
      if (m2 && PATH_SECOND_CMDS.test(`#${m2[1]}:`)) {
        cmd = m2[1];
        partial = m2[2];
      }
    }

    if (!cmd) return null;

    // ファイルリストを遅延ロード
    ensureLoaded();

    const fileList = fileListRef.current;
    if (!fileList || fileList.length === 0) return null;

    const extFilter = getExtFilter(cmd);
    // partial の先頭 ./ を除いて部分一致検索
    const normalizedPartial = partial.replace(/^\.\//, "").toLowerCase();

    const options = fileList
      .filter(f => extFilter.test(f))
      .filter(f => !normalizedPartial || f.toLowerCase().includes(normalizedPartial))
      .slice(0, 50)
      .map(f => ({ label: "./" + f, type: "text" }));

    if (options.length === 0) return null;

    return {
      from: context.pos - partial.length,
      options,
      validFor: /^[^,\n]*$/,
    };
  };
}

// シーン名・アイテム名補完ソース生成
function createNameCompletionSource(listRef, cmdRegex) {
  return (context) => {
    if (!listRef?.current?.length) return null;

    const line = context.state.doc.lineAt(context.pos);
    const textBefore = line.text.slice(0, context.pos - line.from);

    // 第1引数の位置にいるかチェック（カンマなし）: "#cmd: partial"
    const m = textBefore.match(/^#([^\s:]+):\s+([^,]*)$/);
    if (!m || !cmdRegex.test(`#${m[1]}:`)) return null;

    const partial = m[2];
    const lowerPartial = partial.toLowerCase();
    const options = listRef.current
      .filter(name => !lowerPartial || name.toLowerCase().includes(lowerPartial))
      .map(name => ({ label: name, type: "text" }));

    if (options.length === 0) return null;

    return {
      from: context.pos - partial.length,
      options,
      validFor: /^[^,\n]*$/,
    };
  };
}

// 補完拡張を作成（ファイルリストref付き）
export function createEventCompletionExtension(fileListRef, ensureLoaded, sceneListRef, itemListRef) {
  const pathSource = createPathCompletionSource(fileListRef, ensureLoaded);
  const sceneSource = createNameCompletionSource(sceneListRef, SCENE_FIRST_CMDS);
  const itemSource = createNameCompletionSource(itemListRef, ITEM_FIRST_CMDS);
  return autocompletion({
    override: [eventCompletions, pathSource, sceneSource, itemSource],
    activateOnTyping: true,
    maxRenderedOptions: 30,
  });
}

// コマンド補完のみの静的版（後方互換）
export const eventCompletionExtension = autocompletion({
  override: [eventCompletions],
  activateOnTyping: true,
  maxRenderedOptions: 30,
});

export default commands;
