$baseImage = "base.jpg"
$baseFolder = "base"

Write-Host ">>Make sure to have ImageMagick CLI installed"
Write-Host "Step 1: Upscaling and sharpening..."
magick $baseImage -resize 200% -unsharp 0x1.2 sharp_big.png

Write-Host "Step 2: Removing black background..."
magick sharp_big.png -fuzz 10% -transparent black logo-transparent.png

Write-Host "Step 3: Creating master image..."
magick logo-transparent.png -resize 1024x1024 master.png

Write-Host "Step 4: Generating icon sizes..."

$sizes = @(16,32,48,64,128,256,512,1024)

foreach ($size in $sizes) {
    $output = "logo-$size.png"
    magick master.png -resize ${size}x${size} $output
    Write-Host "Created $output"
}

Write-Host "Step 5: Creating favicon.ico..."
magick master.png -define icon:auto-resize=256,128,64,48,32,16 favicon.ico

Write-Host "Step 6: Creating base folder if needed..."
if (!(Test-Path $baseFolder)) {
    New-Item -ItemType Directory -Name $baseFolder | Out-Null
    Write-Host "Created folder: base"
}

Write-Host "Step 7: Moving original and master files..."
Move-Item -Force base.jpg "$baseFolder/base.jpg"
Move-Item -Force master.png "$baseFolder/master.png"

Write-Host "Icon pipeline complete."