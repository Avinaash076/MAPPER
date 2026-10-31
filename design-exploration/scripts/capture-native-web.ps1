$ErrorActionPreference = 'Stop'
$outputRoot = Join-Path (Split-Path $PSScriptRoot -Parent) 'screenshots'
$captures = @(
    @{ Name='app-welcome'; Path='/'; Size='520,1400' },
    @{ Name='app-setup'; Path='/setup'; Size='520,1400' },
    @{ Name='app-discover'; Path='/discover'; Size='520,1800' },
    @{ Name='app-place'; Path='/place/unkal-lake'; Size='520,2000' },
    @{ Name='app-plan-empty'; Path='/plan'; Size='520,1400' },
    @{ Name='app-saved-empty'; Path='/saved'; Size='520,1400' },
    @{ Name='app-contributions'; Path='/contributions'; Size='520,1400' },
    @{ Name='app-assistant'; Path='/assistant'; Size='520,1600' },
    @{ Name='app-welcome-pc'; Path='/'; Size='1440,1100' },
    @{ Name='app-assistant-pc'; Path='/assistant'; Size='1440,1400' }
)
foreach ($capture in $captures) {
    $profile = Join-Path $env:TEMP "mapper-screenshot-$([guid]::NewGuid())"
    $output = Join-Path $outputRoot "$($capture.Name).png"
    $url = "http://localhost:4320$($capture.Path)?capture=1"
    $arguments = @('--headless=new','--no-first-run','--hide-scrollbars','--enable-unsafe-swiftshader',"--window-size=$($capture.Size)",'--timeout=60000',"`"--user-data-dir=$profile`"","`"--screenshot=$output`"","`"$url`"")
    Start-Process -FilePath 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' -ArgumentList $arguments -WindowStyle Hidden -Wait
    if (-not (Test-Path -LiteralPath $output)) { throw "Missing capture: $output" }
    Write-Output "Captured $($capture.Name)"
    $resolved = [IO.Path]::GetFullPath($profile)
    $tempRoot = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
    if ($resolved.StartsWith($tempRoot,[StringComparison]::OrdinalIgnoreCase) -and (Split-Path $resolved -Leaf).StartsWith('mapper-screenshot-')) { Remove-Item -LiteralPath $resolved -Recurse -Force -ErrorAction SilentlyContinue }
}
