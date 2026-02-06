// イベントファイル用のCodeMirrorテーマ
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// ライトテーマのハイライトスタイル
const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#7c3aed" },           // #コマンド: 紫
  { tag: tags.controlKeyword, color: "#db2777" },    // #if, #else: マゼンタ
  { tag: tags.labelName, color: "#ea580c" },         // 【ラベル】: オレンジ
  { tag: tags.string, color: "#059669" },            // 「セリフ」: 緑
  { tag: tags.variableName, color: "#0891b2" },      // [変数名]: シアン
  { tag: tags.typeName, color: "#ca8a04" },          // キャラ名（表情）: 黄色
  { tag: tags.comment, color: "#9ca3af", fontStyle: "italic" },  // コメント: グレー
  { tag: tags.strong, color: "#dc2626", fontWeight: "bold" },    // "強調": 赤太字
]);

// ダークテーマのハイライトスタイル
const darkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#a78bfa" },           // #コマンド: 薄紫
  { tag: tags.controlKeyword, color: "#f472b6" },    // #if, #else: ピンク
  { tag: tags.labelName, color: "#fb923c" },         // 【ラベル】: オレンジ
  { tag: tags.string, color: "#34d399" },            // 「セリフ」: 緑
  { tag: tags.variableName, color: "#22d3ee" },      // [変数名]: シアン
  { tag: tags.typeName, color: "#facc15" },          // キャラ名（表情）: 黄色
  { tag: tags.comment, color: "#6b7280", fontStyle: "italic" },  // コメント: グレー
  { tag: tags.strong, color: "#f87171", fontWeight: "bold" },    // "強調": 赤太字
]);

// ライトテーマのエディタスタイル
const lightTheme = EditorView.theme({
  "&": {
    backgroundColor: "#ffffff",
    color: "#1f2937",
  },
  ".cm-content": {
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontSize: "13px",
    lineHeight: "1.5",
    caretColor: "#1f2937",
  },
  ".cm-cursor": {
    borderLeftColor: "#1f2937",
  },
  ".cm-activeLine": {
    backgroundColor: "#f3f4f6",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "#bfdbfe",
  },
  ".cm-gutters": {
    backgroundColor: "#f9fafb",
    color: "#9ca3af",
    border: "none",
    borderRight: "1px solid #e5e7eb",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#f3f4f6",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 8px 0 4px",
  },
  ".cm-tooltip": {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "#eff6ff",
      color: "#1f2937",
    },
  },
}, { dark: false });

// ダークテーマのエディタスタイル
const darkTheme = EditorView.theme({
  "&": {
    backgroundColor: "#1e1e1e",
    color: "#e5e7eb",
  },
  ".cm-content": {
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontSize: "13px",
    lineHeight: "1.5",
    caretColor: "#e5e7eb",
  },
  ".cm-cursor": {
    borderLeftColor: "#e5e7eb",
  },
  ".cm-activeLine": {
    backgroundColor: "#2d2d2d",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "#264f78",
  },
  ".cm-gutters": {
    backgroundColor: "#252526",
    color: "#6b7280",
    border: "none",
    borderRight: "1px solid #3f3f3f",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#2d2d2d",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 8px 0 4px",
  },
  ".cm-tooltip": {
    backgroundColor: "#252526",
    border: "1px solid #3f3f3f",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "#094771",
      color: "#e5e7eb",
    },
  },
}, { dark: true });

// テーマ拡張をエクスポート
export const lightExtensions = [lightTheme, syntaxHighlighting(lightHighlightStyle)];
export const darkExtensions = [darkTheme, syntaxHighlighting(darkHighlightStyle)];
