# ================================
# 全 OS / アーキテクチャ向け Go ビルド
# ================================

$targets = @(
    @{ os="windows"; arch="amd64"; ext=".exe" },
    @{ os="windows"; arch="arm64"; ext=".exe" },
    @{ os="linux";   arch="amd64"; ext="" },
    @{ os="linux";   arch="arm64"; ext="" },
    @{ os="darwin";  arch="amd64"; ext="" },
    @{ os="darwin";  arch="arm64"; ext="" }
)

$projectName = "tojinovel"

# 出力フォルダ作成
$output = "build"
Remove-Item $output -Recurse -Force -ErrorAction Ignore

foreach ($t in $targets) {
    $env:GOOS  = $t.os
    $env:GOARCH = $t.arch

    $fileName = "$projectName-$($t.os)-$($t.arch)$($t.ext)"
    $outPath = "$output/$fileName"

    Write-Host "Building $fileName..."

    go build -o $outPath .

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed for $($t.os)/$($t.arch)"
    } else {
        Write-Host "✅ Success: $fileName"
    }
}

Write-Host "🎉 All builds completed!"
