# Generate placeholder icons for Laguntzaile extension
# This script creates simple colored square icons

Add-Type -AssemblyName System.Drawing

$sizes = @(16, 32, 48, 128)
$assetsPath = Join-Path $PSScriptRoot "..\assets"

# Create assets directory if it doesn't exist
if (-not (Test-Path $assetsPath)) {
    New-Item -ItemType Directory -Path $assetsPath -Force | Out-Null
}

foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Fill with gradient-like blue color
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 74, 144, 217))
    $graphics.FillRectangle($brush, 0, 0, $size, $size)
    
    # Add a simple "L" letter in white
    $fontSize = [Math]::Floor($size * 0.6)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $graphics.DrawString("L", $font, $whiteBrush, $rect, $stringFormat)
    
    # Save the icon
    $iconPath = Join-Path $assetsPath "icon$size.png"
    $bitmap.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $font.Dispose()
    $brush.Dispose()
    $whiteBrush.Dispose()
    
    Write-Host "Created: $iconPath"
}

Write-Host "All icons generated successfully!"
