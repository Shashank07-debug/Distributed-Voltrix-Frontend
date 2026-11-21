$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\shash\.gemini\antigravity\brain\76e7efa3-e4a8-4894-82da-c31786f46281"

Write-Host "Capturing screenshots..."

# 1. Hero mid-typing (at 1440, 768, 375px) with virtual-time-budget=600ms
$viewports = @(
    @{ name = "hero-mid-1440"; w = 1440; h = 900; budget = 650 },
    @{ name = "hero-mid-768"; w = 768; h = 900; budget = 650 },
    @{ name = "hero-mid-375"; w = 375; h = 800; budget = 650 },
    @{ name = "hero-finished-1440"; w = 1440; h = 950; budget = 4500 },
    @{ name = "hero-finished-768"; w = 768; h = 1000; budget = 4500 },
    @{ name = "hero-finished-375"; w = 375; h = 1100; budget = 4500 },
    @{ name = "landing-v3-1440"; w = 1440; h = 5400; budget = 4500 },
    @{ name = "landing-v3-768"; w = 768; h = 6000; budget = 4500 },
    @{ name = "landing-v3-375"; w = 375; h = 6800; budget = 4500 }
)

foreach ($vp in $viewports) {
    $outFile = "$outDir\$($vp.name).png"
    $tmpFile = "$env:TEMP\$($vp.name).png"
    Write-Host "Capturing $($vp.name) (${vp.w}x${vp.h})..."
    Start-Process $chromePath -ArgumentList "--headless=new", "--virtual-time-budget=$($vp.budget)", "--screenshot=$tmpFile", "--window-size=$($vp.w),$($vp.h)", "--hide-scrollbars", "http://localhost:5173/" -Wait -NoNewWindow
    if (Test-Path $tmpFile) {
        Copy-Item $tmpFile $outFile -Force
        Remove-Item $tmpFile -Force
        Write-Host "Saved $outFile"
    } else {
        Write-Host "Failed to generate $tmpFile"
    }
}

Write-Host "All screenshots captured successfully."
