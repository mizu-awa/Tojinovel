# samples/[サンプル名]/data を public/data にコピーするスクリプト
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
$source = "$samplesDir/$SampleName/data"
$dest = "./public/data"

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

# 既存のdataフォルダを削除してコピー
Remove-Item $dest -Recurse -Force -ErrorAction Ignore
Copy-Item $source $dest -Recurse

Write-Host "OK: '$SampleName' のデータを public/data にコピーしました" -ForegroundColor Green
exit 0
