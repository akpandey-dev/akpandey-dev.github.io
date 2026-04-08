$ErrorActionPreference = "Stop"

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Define icons directory (relative to script)
$iconsDir = Join-Path $scriptDir "../assets/icons"
$iconsDir = Resolve-Path $iconsDir

# Define files
$baseImage = Join-Path $iconsDir "base.jpg"
$sharpBig = Join-Path $iconsDir "sharp_big.png"
$transparent = Join-Path $iconsDir "logo-transparent.png"
$master = Join-Path $iconsDir "master.png"
$baseFolder = Join-Path $iconsDir "base"

Write-Host ">> Using icons directory: $iconsDir"

# Check input exists
if (!(Test-Path $baseImage)) {
    Write-Host "ERROR: base.jpg not found in assets/icons/"
    exit 1
}

Write-Host "Step 1: Upscaling and sharpening..."
magick $baseImage -resize 200% -unsharp 0x1.2 $sharpBig

Write-Host "Step 2: Removing black background..."
magick $sharpBig -fuzz 10% -transparent black $transparent

Write-Host "Step 3: Creating master image..."
magick $transparent -resize 1024x1024 $master

Write-Host "Step 4: Generating icon sizes..."
$sizes = @(16,32,48,64,128,256,512,1024)

foreach ($size in $sizes) {
    $output = Join-Path $iconsDir "logo-$size.png"
    magick $master -resize ${size}x${size} $output
    Write-Host "Created $output"
}

Write-Host "Step 5: Creating favicon.ico..."
$favicon = Join-Path $iconsDir "favicon.ico"
magick $master -define icon:auto-resize=256,128,64,48,32,16 $favicon

Write-Host "Step 6: Creating base folder if needed..."
if (!(Test-Path $baseFolder)) {
    New-Item -ItemType Directory -Path $baseFolder | Out-Null
    Write-Host "Created folder: base"
}

Write-Host "Step 7: Moving original and master files..."
Move-Item -Force $baseImage (Join-Path $baseFolder "base.jpg")
Move-Item -Force $master (Join-Path $baseFolder "master.png")

Write-Host "Icon pipeline complete."