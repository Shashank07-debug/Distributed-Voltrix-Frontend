$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\shash\.gemini\antigravity\brain\76e7efa3-e4a8-4894-82da-c31786f46281"

Write-Host "Capturing contact and footer screenshots..."

$viewports = @(
    @{ name = "contact-1440"; w = 1440; h = 800; url = "http://localhost:5173/#contact" },
    @{ name = "contact-768"; w = 768; h = 800; url = "http://localhost:5173/#contact" },
    @{ name = "contact-375"; w = 375; h = 800; url = "http://localhost:5173/#contact" }
)

foreach ($vp in $viewports) {
    $outFile = "$outDir\$($vp.name).png"
    $tmpFile = "$env:TEMP\$($vp.name).png"
    Write-Host "Capturing $($vp.name)..."
    Start-Process $chromePath -ArgumentList "--headless=new", "--virtual-time-budget=2000", "--screenshot=$tmpFile", "--window-size=$($vp.w),$($vp.h)", "--hide-scrollbars", $vp.url -Wait -NoNewWindow
    if (Test-Path $tmpFile) {
        Copy-Item $tmpFile $outFile -Force
        Remove-Item $tmpFile -Force
        Write-Host "Saved $outFile"
    }
}

Write-Host "Done contact screenshots."
