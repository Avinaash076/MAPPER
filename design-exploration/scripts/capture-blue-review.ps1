$ErrorActionPreference = 'Stop'
$outputRoot = Join-Path (Split-Path $PSScriptRoot -Parent) 'screenshots'
$baseUrl = 'http://localhost:4313/?page=stage4&screen=Discover&variant=1&compare=0&frame=1&capture=1'
$captures = @(
    @{ Name = 'blue-discover-mobile-light'; Size = '390,1250'; Query = '&mode=light' },
    @{ Name = 'blue-discover-mobile-dark'; Size = '390,1250'; Query = '&mode=dark&map=dark' },
    @{ Name = 'blue-discover-desktop-light'; Size = '1440,1150'; Query = '&mode=light&desktop=1' },
    @{ Name = 'blue-discover-desktop-dark'; Size = '1440,1150'; Query = '&mode=dark&map=dark&desktop=1' },
    @{ Name = 'blue-discover-narrow-large-text'; Size = '320,1800'; Query = '&mode=dark&width=320&text=large' }
)
$captures | ForEach-Object {
    $profile = Join-Path $env:TEMP "mapper-screenshot-$([guid]::NewGuid())"
    $output = Join-Path $outputRoot "$($_.Name).png"
    $url = $baseUrl + $_.Query
    $arguments = @('--headless=new', '--no-first-run', '--hide-scrollbars', '--enable-unsafe-swiftshader', "--window-size=$($_.Size)", '--timeout=45000', "`"--user-data-dir=$profile`"", "`"--screenshot=$output`"", "`"$url`"")
    Start-Process -FilePath 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' -ArgumentList $arguments -WindowStyle Hidden -Wait
    if (-not (Test-Path -LiteralPath $output)) { throw "Missing capture: $output" }
    Write-Output "Captured $($_.Name)"
    $resolved = [IO.Path]::GetFullPath($profile)
    $tempRoot = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
    if ($resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase) -and (Split-Path $resolved -Leaf).StartsWith('mapper-screenshot-')) {
        Remove-Item -LiteralPath $resolved -Recurse -Force -ErrorAction SilentlyContinue
    }
}
