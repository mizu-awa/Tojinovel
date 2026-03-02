# Wails アプリのビルドとリリースZIP作成スクリプト
# カレントOS用のビルドを行い、release/ にパッケージングする
# クロスビルドは将来CI/CDで対応予定

# プロジェクトルートに移動
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

# Wails ビルド
Write-Host "=== Wails ビルド ===" -ForegroundColor Cyan
if ($IsLinux) {
    wails build -tags webkit2_41
} else {
    wails build
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: wails build が失敗しました" -ForegroundColor Red
    exit 1
}

# バージョン読み取り
$version = "unknown"
$envPath = ".env.local"
if (Test-Path $envPath) {
    $envText = Get-Content $envPath
    $commit = ($envText | Where-Object { $_ -match "^VITE_COMMIT_HASH=" }) `
                -replace "VITE_COMMIT_HASH=", ""
    $release = ($envText | Where-Object { $_ -match "^VITE_RELEASE_VERSION=" }) `
                -replace "VITE_RELEASE_VERSION=", ""
    if ($release -and $release.Trim() -ne "") {
        $version = $release.Trim()
    } elseif ($commit -and $commit.Trim() -ne "") {
        $version = $commit.Trim()
    }
}
Write-Host "バージョン: $version" -ForegroundColor Cyan

# 出力ディレクトリ作成
Remove-Item ./release -Recurse -Force -ErrorAction Ignore
New-Item -ItemType Directory -Path ./release | Out-Null

Add-Type -AssemblyName System.IO.Compression.FileSystem

# リリースZIP作成
Write-Host "=== リリースZIP作成 ===" -ForegroundColor Cyan

$tempDir = "./release/tmp"
Remove-Item $tempDir -Recurse -Force -ErrorAction Ignore
New-Item -ItemType Directory -Path $tempDir | Out-Null

# バイナリ（build/bin/ 以下のすべてのファイル）
$binDir = "./build/bin"
if (Test-Path $binDir) {
    Get-ChildItem $binDir -File | ForEach-Object {
        Copy-Item $_.FullName $tempDir
    }
} else {
    Write-Host "警告: $binDir が見つかりません" -ForegroundColor Yellow
}

# 共通ファイル
if (Test-Path ./LICENSE) { Copy-Item ./LICENSE $tempDir }
if (Test-Path ./docs/distribution/README.txt) {
    Copy-Item ./docs/distribution/README.txt $tempDir
}

# OS名（簡易判定）
$osName = "windows"
if ($IsLinux) { $osName = "linux" }
if ($IsMacOS) { $osName = "mac" }

$zipPath = "./release/tojinovel-$version-$osName.zip"
Remove-Item $zipPath -Force -ErrorAction Ignore
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)
Remove-Item $tempDir -Recurse -Force
Write-Host "OK: $zipPath" -ForegroundColor Green

# サンプルZIP作成
Write-Host "=== サンプルZIP作成 ===" -ForegroundColor Cyan
$sampleRoot = "./samples"
$destRoot = "./release/samples/"
New-Item -ItemType Directory -Path $destRoot | Out-Null

Get-ChildItem $sampleRoot -Directory | ForEach-Object {
    $sourcePath = $_.FullName
    $destPath = "${destRoot}$($_.Name).zip"
    Remove-Item $destPath -Force -ErrorAction Ignore
    [System.IO.Compression.ZipFile]::CreateFromDirectory($sourcePath, $destPath)
    Write-Host "OK: $destPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== ビルド完了 ===" -ForegroundColor Green
Write-Host "出力先: ./release/"
