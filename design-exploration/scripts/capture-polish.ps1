param([string[]]$Only = @())
$ErrorActionPreference = 'Stop'
$outputRoot = Join-Path (Split-Path $PSScriptRoot -Parent) 'screenshots'
$captures = @(
    @{ Name='polish-discover-phone-light'; Path='/discover?capture=1&theme=light'; Size='520,1000' },
    @{ Name='polish-discover-pc-dark'; Path='/discover?capture=1&theme=dark'; Size='1440,1000' },
    @{ Name='polish-assistant-dark'; Path='/assistant?capture=1&theme=dark'; Size='520,1000' },
    @{ Name='polish-setup-light'; Path='/setup?capture=1&theme=light'; Size='520,1000' },
    @{ Name='polish-plan-light'; Path='/plan?capture=1&theme=light'; Size='520,1500' },
    @{ Name='polish-place-dark'; Path='/place/unkal-lake?capture=1&theme=dark'; Size='520,1600' },
    @{ Name='polish-contribution-light'; Path='/contribute?id=ui-review-draft&capture=1&theme=light'; Size='520,1500' },
    @{ Name='polish-drafts-dark'; Path='/contributions?capture=1&theme=dark'; Size='520,1000' }
)
foreach ($capture in $captures) {
    if ($Only.Count -gt 0 -and $capture.Name -notin $Only) { continue }
    $profile = Join-Path $env:TEMP "mapper-polish-screenshot-$([guid]::NewGuid())"
    $output = Join-Path $outputRoot "$($capture.Name).png"
    $url = "http://localhost:4320$($capture.Path)"
    $arguments = @('--headless=new','--no-first-run','--hide-scrollbars','--enable-unsafe-swiftshader',"--window-size=$($capture.Size)",'--timeout=60000',"`"--user-data-dir=$profile`"","`"--screenshot=$output`"","`"$url`"")
    Start-Process -FilePath 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' -ArgumentList $arguments -WindowStyle Hidden -Wait
    if (-not (Test-Path -LiteralPath $output)) { throw "Missing capture: $output" }
    Write-Output "Captured $($capture.Name)"
    $resolved = [IO.Path]::GetFullPath($profile)
    $tempRoot = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
    if ($resolved.StartsWith($tempRoot,[StringComparison]::OrdinalIgnoreCase) -and (Split-Path $resolved -Leaf).StartsWith('mapper-polish-screenshot-')) {
        Remove-Item -LiteralPath $resolved -Recurse -Force -ErrorAction SilentlyContinue
    }
}
