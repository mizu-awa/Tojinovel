// イベントファイル用のコマンド自動補完
import { autocompletion } from "@codemirror/autocomplete";

// コマンド一覧（wiki/05-event-reference.md ベース）
const commands = [
  // 基本制御
  { label: "#クリック待ち", type: "keyword", info: "プレイヤーのクリックを待つ" },
  { label: "#ファイルジャンプ: ", type: "keyword", info: "ファイル名, ラベル名", detail: "別ファイルにジャンプ" },

  // 条件分岐
  { label: "#if: ", type: "keyword", info: "変数名 演算子 値", detail: "条件分岐開始" },
  { label: "#else", type: "keyword", info: "条件が偽の場合の処理" },
  { label: "#if終了", type: "keyword", info: "条件分岐終了" },

  // フラグ操作
  { label: "#フラグ: ", type: "keyword", info: "変数名 演算子 値", detail: "変数を操作" },
  { label: "#乱数: ", type: "keyword", info: "変数名, 最小値, 最大値", detail: "乱数を生成" },

  // キャラクター
  { label: "#キャラ非表示", type: "keyword", info: "全キャラの立ち絵を非表示" },
  { label: "#キャラ非表示解除", type: "keyword", info: "立ち絵の非表示を解除" },
  { label: "#キャラクリア", type: "keyword", info: "全キャラを退場" },
  { label: "#テキストクリア", type: "keyword", info: "テキストを消去" },

  // シーン
  { label: "#シーン移動: ", type: "keyword", info: "シーン名", detail: "シーンを移動" },
  { label: "#シーン背景変更: ", type: "keyword", info: "シーン名, 背景画像URL" },
  { label: "#ステート変更: ", type: "keyword", info: "シーン名, ホットスポット名, ステート名" },
  { label: "#ステート一括変更: ", type: "keyword", info: "シーン名, ステート名" },

  // アイテム
  { label: "#アイテム入手: ", type: "keyword", info: "アイテム名", detail: "アイテムを入手" },
  { label: "#アイテム破棄: ", type: "keyword", info: "アイテム名", detail: "アイテムを破棄" },
  { label: "#アイテム背景変更: ", type: "keyword", info: "アイテム名, 背景画像URL" },
  { label: "#アイテムステート変更: ", type: "keyword", info: "アイテム名, ホットスポット名, ステート名" },
  { label: "#アイテムステート一括変更: ", type: "keyword", info: "アイテム名, ステート名" },
  { label: "#アイテム画面: ", type: "keyword", info: "アイテム名", detail: "アイテム詳細を開く" },
  { label: "#アイテム画面閉じる", type: "keyword", info: "アイテム詳細を閉じる" },

  // 背景・画像
  { label: "#背景: ", type: "keyword", info: "画像URL または HEXカラー, アニメーション名" },
  { label: "#背景クリア", type: "keyword", info: "背景を削除" },
  { label: "#画像: ", type: "keyword", info: "画像URL", detail: "画像を表示" },
  { label: "#画像クリア", type: "keyword", info: "画像を削除" },

  // 選択肢・入力
  { label: "#選択肢", type: "keyword", info: "選択肢ブロック開始" },
  { label: "#選択肢終了", type: "keyword", info: "選択肢ブロック終了" },
  { label: "#入力: ", type: "keyword", info: "変数名", detail: "入力フォームを表示" },

  // 音声
  { label: "#BGM: ", type: "keyword", info: "音声ファイルURL", detail: "BGMを再生" },
  { label: "#BGM停止", type: "keyword", info: "BGMを停止" },
  { label: "#SE: ", type: "keyword", info: "音声ファイルURL", detail: "SEを再生" },
  { label: "#BGM音量: ", type: "keyword", info: "数値（0-100）" },
  { label: "#SE音量: ", type: "keyword", info: "数値（0-100）" },
  { label: "#ボイス音量: ", type: "keyword", info: "数値（0-100）" },

  // リンク
  { label: "#ハイパーリンク: ", type: "keyword", info: "URL, ターゲット" },

  // セーブ・ロード
  { label: "#セーブ画面", type: "keyword", info: "セーブ画面を開く" },
  { label: "#ロード画面", type: "keyword", info: "ロード画面を開く" },
  { label: "#セーブ: ", type: "keyword", info: "スロット番号", detail: "指定スロットにセーブ" },
  { label: "#ロード: ", type: "keyword", info: "スロット番号", detail: "指定スロットからロード" },
  { label: "#コンフィグ画面", type: "keyword", info: "コンフィグ画面を開く" },
  { label: "#文字送り速度: ", type: "keyword", info: "数値（ms）" },

  // タイマー
  { label: "#タイマー: ", type: "keyword", info: "変数名, 開始値, 終了値[, ファイル, ラベル]" },
  { label: "#タイマー一時停止: ", type: "keyword", info: "変数名" },
  { label: "#タイマー再開: ", type: "keyword", info: "変数名" },

  // デバッグ
  { label: "#コンソール: ", type: "keyword", info: "出力内容", detail: "デバッグ出力" },
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

// 補完拡張を作成
export const eventCompletionExtension = autocompletion({
  override: [eventCompletions],
  activateOnTyping: true,
  maxRenderedOptions: 30,
});

export default commands;
