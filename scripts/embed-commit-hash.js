// embed-commit-hash.js
import { execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync } from "fs";

let commitHash = "unknown";

try {
  const result = execSync("git rev-parse --short HEAD", {
    stdio: ["ignore", "pipe", "ignore"]
  })
    .toString()
    .trim();

  if (result) {
    commitHash = result;
  }
} catch (e) {
  // Gitが無い / リポジトリでない / その他の失敗
  console.warn("Git hash 取得に失敗しました。'unknown' を使用します。");
}

try {
  const envPath = ".env.local";
  const key = "VITE_COMMIT_HASH";
  const value = commitHash;

  let lines = [];

  if (existsSync(envPath)) {
    lines = readFileSync(envPath, "utf-8")
      .split("\n")
      .filter(line => !line.startsWith(`${key}=`));
  }

  lines.push(`${key}=${value}`);
  writeFileSync(envPath, lines.join("\n") + "\n");
  console.log("Commit hash embedded:", commitHash);
} catch (e) {
  console.error(".env.local の書き込みに失敗しました:", e);
}
