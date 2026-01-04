npm run build             # client build
Set-Location ./server
./build-all.ps1    # server build
Set-Location ../

# 出力ディレクトリ作成
Remove-Item ./release -Recurse -Force -ErrorAction Ignore
New-Item -ItemType Directory -Path ./release

# バージョンの読み取り
$envText = Get-Content ".env.local"
$commit = ($envText | Where-Object { $_ -match "^VITE_COMMIT_HASH=" }) `
            -replace "VITE_COMMIT_HASH=", ""
$release = ($envText | Where-Object { $_ -match "^RELEASE_VERSION=" }) `
            -replace "RELEASE_VERSION=", ""

if ($release -and $release.Trim() -ne "") {
    $version = $release
} else {
    $version = $commit
}

# zip作成
## zipの出力設定
$osPackages = @(
    @{
        name = "windows"
        match = "*windows*"
        exeExt = ".exe"
    },
    @{
        name = "linux"
        match = "*linux*"
        exeExt = ""
    },
    @{
        name = "mac"
        match = "*darwin*"
        exeExt = ""
    }
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

foreach ($os in $osPackages) {

    $tempDir = "./release/tmp-$($os.name)"
    Remove-Item $tempDir -Recurse -Force -ErrorAction Ignore
    New-Item -ItemType Directory -Path $tempDir | Out-Null

    # 共通ファイル
    Copy-Item ./dist "$tempDir/game" -Recurse
    Copy-Item ./LICENSE $tempDir
    Copy-Item ./docs/distribution/README.txt $tempDir

    # OS別実行ファイル
    Get-ChildItem ./server/build -File |
        Where-Object { $_.Name -like $os.match } |
        ForEach-Object {
            Copy-Item $_.FullName $tempDir
        }

    # zip 作成
    $zipPath = "./release/tojinovel-$version-$($os.name).zip"
    Remove-Item $zipPath -Force -ErrorAction Ignore

    [System.IO.Compression.ZipFile]::CreateFromDirectory(
        $tempDir,
        $zipPath
    )

    # 一時フォルダ削除
    Remove-Item $tempDir -Recurse -Force
}



# サンプル
$sampleRoot = "./samples"
$destRoot   = "./release/samples/"

## サンプル用のフォルダ作成
New-Item -ItemType Directory -Path $destRoot

## サンプルでループ
Get-ChildItem $sampleRoot -Directory | ForEach-Object {
    $sourcePath = $_.FullName
    $destPath   = "${destRoot}$($_.Name).zip"

    # zip 作成
    Remove-Item $destPath -Force -ErrorAction Ignore

    [System.IO.Compression.ZipFile]::CreateFromDirectory(
        $sourcePath,
        $destPath
    )
}