param(
    [string[]]$Screens = @('Welcome', 'Map appearance', 'Preferences', 'Discover', 'Map', 'Search & filters', 'Place details', 'Hidden places', 'Contribute', 'Drafts & review'),
    [string[]]$Modes = @('light', 'dark')
)
$ErrorActionPreference = 'Stop'
$previewRoot = Split-Path $PSScriptRoot -Parent
$outputRoot = Join-Path $previewRoot 'screenshots'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$captures = foreach ($screen in $Screens) {
    foreach ($mode in $Modes) {
        $slug = ($screen.ToLowerInvariant() -replace '[^a-z]+', '-').Trim('-')
        [pscustomobject]@{ Name = "$slug-$mode"; Url = "http://localhost:4313/?page=stage4&screen=$([uri]::EscapeDataString($screen))&mode=$mode&capture=1"; OutputRoot = $outputRoot }
    }
}
$captures | ForEach-Object -Parallel {
    $profile = Join-Path $env:TEMP "mapper-screenshot-$([guid]::NewGuid())"
    $output = Join-Path $_.OutputRoot "stage4-$($_.Name).png"
    $arguments = @('--headless=new', '--no-first-run', '--hide-scrollbars', '--enable-unsafe-swiftshader', '--window-size=1440,3300', '--timeout=45000', "`"--user-data-dir=$profile`"", "`"--screenshot=$output`"", "`"$($_.Url)`"")
    Start-Process -FilePath 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' -ArgumentList $arguments -WindowStyle Hidden -Wait
    if (-not (Test-Path -LiteralPath $output)) { throw "Capture did not create $output" }
    Write-Output "Captured $($_.Name)"
    # Delete only the fresh temporary profile owned by this capture.
    $resolved = [IO.Path]::GetFullPath($profile)
    $tempRoot = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
    if ($resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase) -and (Split-Path $resolved -Leaf).StartsWith('mapper-screenshot-')) {
        Remove-Item -LiteralPath $resolved -Recurse -Force -ErrorAction SilentlyContinue
    }
} -ThrottleLimit 2
