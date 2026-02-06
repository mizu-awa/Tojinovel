# サンプルデータをコピーして開発サーバーを起動するスクリプト
# 使用例: ./scripts/dev-test.ps1 event_test

param(
    [Parameter(Position=0)]
    [string]$SampleName = "event_test"
)

# プロジェクトルートに移動
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

# サンプルデータをコピー
Write-Host "=== サンプルデータをコピー ===" -ForegroundColor Cyan
& "$scriptDir/use-sample.ps1" $SampleName
if ($LASTEXITCODE -ne 0) {
    exit 1
}

Write-Host ""
Write-Host "=== 開発サーバーを起動 ===" -ForegroundColor Cyan

# Goサーバーを新しいターミナルで起動
Write-Host "Go サーバーを起動中..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot'; ./server/dev.ps1"

# 少し待ってからViteを起動（Goサーバーが先に立ち上がるように）
Start-Sleep -Seconds 1

# Vite開発サーバーを新しいターミナルで起動
Write-Host "Vite 開発サーバーを起動中..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot'; npm run dev"

Write-Host ""
Write-Host "=== 起動完了 ===" -ForegroundColor Green
Write-Host "デバッグプレイヤー: http://localhost:5173/debug.html"
Write-Host "エディタ:           http://localhost:5173/editor.html"
Write-Host ""
Write-Host "終了するには、開いた2つのターミナルを閉じてください。"
