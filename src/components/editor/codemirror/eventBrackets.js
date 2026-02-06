// 日本語括弧の自動閉じ
import { EditorView } from "@codemirror/view";

// 日本語括弧のペア定義
const bracketPairs = {
  "「": "」",
  "【": "】",
  "（": "）",
  "『": "』",
  '"': '"',
};

// 括弧自動閉じの入力ハンドラ
export const closeBracketsExtension = EditorView.inputHandler.of((view, from, to, text) => {
  // 入力された文字が開き括弧かチェック
  const closingBracket = bracketPairs[text];
  if (!closingBracket) return false;

  // 選択範囲がある場合は囲む
  const selection = view.state.selection.main;
  if (selection.from !== selection.to) {
    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text + selectedText + closingBracket },
      selection: { anchor: selection.from + 1, head: selection.from + 1 + selectedText.length },
    });
    return true;
  }

  // 開き括弧と閉じ括弧を両方挿入してカーソルを中央に
  view.dispatch({
    changes: { from, to, insert: text + closingBracket },
    selection: { anchor: from + 1 },
  });
  return true;
});
