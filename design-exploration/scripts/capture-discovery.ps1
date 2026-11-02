param([string[]]$Only = @())
$ErrorActionPreference = 'Stop'
$outputRoot = Join-Path (Split-Path $PSScriptRoot -Parent) 'screenshots'
$captures = @(
    @{ Name='discovery-welcome-light'; Path='/?capture=1&theme=light'; Size='520,1100' },
    @{ Name='discovery-search-dark'; Path='/destination?capture=1&theme=dark'; Size='520,1400' },
    @{ Name='discovery-surprise-light'; Path='/surprise?capture=1&theme=light'; Size='520,1200' },
    @{ Name='discovery-start-dark'; Path='/starting-point?capture=1&theme=dark'; Size='520,1100' },
    @{ Name='discovery-experience-light'; Path='/trip-experience?capture=1&theme=light'; Size='520,1200' },
    @{ Name='discovery-options-dark'; Path='/trip-options?capture=1&theme=dark'; Size='520,1200' },
    @{ Name='discovery-trip-light'; Path='/trip-map?capture=1&theme=light'; Size='520,1000' },
    @{ Name='discovery-details-dark'; Path='/trip-map?panel=details&capture=1&theme=dark'; Size='520,1500' },
    @{ Name='discovery-suggestions-light'; Path='/trip-map?panel=places&capture=1&theme=light'; Size='520,1500' },
    @{ Name='discovery-trip-pc-dark'; Path='/trip-map?capture=1&theme=dark'; Size='1440,1000' }
)
foreach ($capture in $captures) {
    if ($Only.Count -gt 0 -and $capture.Name -notin $Only) { continue }
    $profile = Join-Path $env:TEMP "mapper-discovery-screenshot-$([guid]::NewGuid())"
    $output = Join-Path $outputRoot "$($capture.Name).png"
    $url = "http://localhost:4320$($capture.Path)"
    $arguments = @('--headless=new','--no-first-run','--hide-scrollbars','--enable-unsafe-swiftshader',"--window-size=$($capture.Size)",'--timeout=60000',"`"--user-data-dir=$profile`"","`"--screenshot=$output`"","`"$url`"")
    Start-Process -FilePath 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' -ArgumentList $arguments -WindowStyle Hidden -Wait
    if (-not (Test-Path -LiteralPath $output)) { throw "Missing capture: $output" }
    Write-Output "Captured $($capture.Name)"
    $resolved = [IO.Path]::GetFullPath($profile)
    $tempRoot = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
    if ($resolved.StartsWith($tempRoot,[StringComparison]::OrdinalIgnoreCase) -and (Split-Path $resolved -Leaf).StartsWith('mapper-discovery-screenshot-')) {
        Remove-Item -LiteralPath $resolved -Recurse -Force -ErrorAction SilentlyContinue
    }
}
