# samples/[サンプル名] を public/ にコピーするスクリプト
# wails dev のデフォルトプロジェクトパス（./public/）として使用するためのもの
# 使用例: ./scripts/use-sample.ps1 event_test

param(
    [Parameter(Position=0)]
    [string]$SampleName
)

# プロジェクトルートに移動
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

$samplesDir = "./samples"
$source = "$samplesDir/$SampleName"
$dest = "./public"

# サンプル名が指定されていない場合、一覧を表示
if (-not $SampleName) {
    Write-Host "使用方法: ./scripts/use-sample.ps1 <サンプル名>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "利用可能なサンプル:" -ForegroundColor Cyan
    Get-ChildItem $samplesDir -Directory | ForEach-Object {
        Write-Host "  - $($_.Name)"
    }
    exit 0
}

# サンプルが存在するかチェック
if (-not (Test-Path $source)) {
    Write-Host "エラー: サンプル '$SampleName' が見つかりません" -ForegroundColor Red
    Write-Host ""
    Write-Host "利用可能なサンプル:" -ForegroundColor Cyan
    Get-ChildItem $samplesDir -Directory | ForEach-Object {
        Write-Host "  - $($_.Name)"
    }
    exit 1
}

# data/ をコピー
$sourceData = "$source/data"
$destData = "$dest/data"
if (Test-Path $sourceData) {
    Remove-Item $destData -Recurse -Force -ErrorAction Ignore
    Copy-Item $sourceData $destData -Recurse
    Write-Host "OK: data/ をコピーしました" -ForegroundColor Green
}

# system/ をコピー（あれば）
$sourceSystem = "$source/system"
$destSystem = "$dest/system"
if (Test-Path $sourceSystem) {
    Remove-Item $destSystem -Recurse -Force -ErrorAction Ignore
    Copy-Item $sourceSystem $destSystem -Recurse
    Write-Host "OK: system/ をコピーしました" -ForegroundColor Green
}

Write-Host ""
Write-Host "サンプル '$SampleName' の準備完了。" -ForegroundColor Cyan
Write-Host "次のコマンドで開発環境を起動してください:"
Write-Host "  wails dev" -ForegroundColor Yellow
exit 0
