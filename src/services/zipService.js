// ZIPインポート/エクスポートサービス
// ブラウザ版でプロジェクトデータのバックアップ・復元を行う

import JSZip from "jszip";
import {
  initDB,
  listAllFiles,
  writeFile,
  createProject,
} from "./browser/browserFS.js";

// エクスポート: プロジェクト全ファイルをZIPに変換してダウンロード
export async function exportProjectAsZip(projectId, projectName) {
  await initDB();
  const files = await listAllFiles(projectId);

  const zip = new JSZip();

  for (const file of files) {
    // .keepファイルは含めない（ディレクトリプレースホルダー）
    if (file.path.endsWith("/.keep")) continue;

    if (file.type === "text") {
      zip.file(file.path, file.content || "");
    } else if (file.blob) {
      zip.file(file.path, file.blob);
    }
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // ダウンロードトリガー
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (projectName || "project") + ".zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// インポート: ZIPファイルを読み込んで新規プロジェクトとしてIndexedDBに保存
export async function importProjectFromZip(file) {
  await initDB();

  const zip = await JSZip.loadAsync(file);

  // プロジェクト名をZIPファイル名から取得（拡張子除去）
  const projectName = file.name.replace(/\.zip$/i, "") || "Imported Project";

  const project = await createProject(projectName);

  // ZIPの全エントリを処理
  const entries = Object.entries(zip.files);
  for (const [path, zipEntry] of entries) {
    // ディレクトリはスキップ
    if (zipEntry.dir) continue;

    // 空パスはスキップ
    if (!path) continue;

    // テキストかバイナリかをMIME typeで判定
    const ext = "." + path.split(".").pop().toLowerCase();
    const textExts = [".json", ".txt", ".js", ".css", ".html", ".svg", ".xml", ".md"];

    if (textExts.includes(ext)) {
      const content = await zipEntry.async("string");
      await writeFile(project.id, path, content);
    } else {
      const blob = await zipEntry.async("blob");
      await writeFile(project.id, path, blob);
    }
  }

  return project;
}

// フォルダドロップのインポート（File System Access API経由）
export async function importProjectFromFiles(fileList) {
  await initDB();

  // ファイル名からプロジェクト名を推測
  let projectName = "Imported Project";
  if (fileList.length > 0 && fileList[0].webkitRelativePath) {
    const firstPath = fileList[0].webkitRelativePath;
    projectName = firstPath.split("/")[0] || projectName;
  }

  const project = await createProject(projectName);

  for (const file of fileList) {
    // webkitRelativePathからプロジェクトルート相対パスを取得
    let path = file.webkitRelativePath || file.name;
    // 先頭のフォルダ名を除去（プロジェクトルートがフォルダ名になるため）
    const parts = path.split("/");
    if (parts.length > 1) {
      path = parts.slice(1).join("/");
    }

    if (!path) continue;

    // テキストかバイナリか判定
    const ext = "." + path.split(".").pop().toLowerCase();
    const textExts = [".json", ".txt", ".js", ".css", ".html", ".svg", ".xml", ".md"];

    if (textExts.includes(ext)) {
      const content = await file.text();
      await writeFile(project.id, path, content);
    } else {
      await writeFile(project.id, path, file, file.type);
    }
  }

  return project;
}
