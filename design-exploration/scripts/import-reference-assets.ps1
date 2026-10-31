$ErrorActionPreference = 'Stop'
$previewRoot = Split-Path $PSScriptRoot -Parent
$destinationNames = @('Badami', 'Aihole', 'Pattadakal', 'Hampi', 'Gokarna, Karnataka', 'Dandeli')
$titles = [uri]::EscapeDataString($destinationNames -join '|')
$response = Invoke-RestMethod "https://en.wikipedia.org/w/api.php?action=query&titles=$titles&prop=coordinates%7Cpageimages&format=json&piprop=name&redirects=1"
$records = @()
foreach ($page in $response.query.pages.PSObject.Properties.Value) {
    $fileTitle = [uri]::EscapeDataString("File:$($page.pageimage)")
    $imageResponse = Invoke-RestMethod "https://commons.wikimedia.org/w/api.php?action=query&titles=$fileTitle&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=960&format=json"
    $image = ($imageResponse.query.pages.PSObject.Properties.Value | Select-Object -First 1).imageinfo[0]
    $metadata = $image.extmetadata
    if ($metadata.LicenseShortName.value -notmatch 'CC|Public domain') { throw "Review image licence for $($page.title)" }
    $id = ($page.title -split ',')[0].ToLowerInvariant()
    $imageUrl = if ($image.thumburl) { $image.thumburl } else { $image.url }
    Invoke-WebRequest $imageUrl -OutFile (Join-Path $previewRoot "assets/photos/$id.jpg")
    $records += [ordered]@{
        id = $id
        name = $page.title
        coordinates = @($page.coordinates[0].lon, $page.coordinates[0].lat)
        sourceUrl = "https://en.wikipedia.org/wiki/$([uri]::EscapeDataString($page.title))"
        author = [System.Net.WebUtility]::HtmlDecode(($metadata.Artist.value -replace '<[^>]+>', ''))
        license = $metadata.LicenseShortName.value
        licenseUrl = $metadata.LicenseUrl.value
        photoSourceUrl = $image.descriptionurl
        imageUrl = $imageUrl
    }
    Write-Output "Imported $id with $($metadata.LicenseShortName.value) credit."
}
$records | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $previewRoot 'assets/karnataka-references.json') -Encoding utf8
