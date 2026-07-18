$ErrorActionPreference = "Stop"
$path = "C:\Trishna Projects\clozet\frontend\src\components\products-page-content.tsx"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Strategy: Create files with each details section commented out to find the problem
$sections = @(
    @("price", "Price"),
    @("category", "Category"),
    @("size", "Size"),
    @("sleeves", "Sleeves"),
    @("print", "Print"),
    @("color", "Colour")
)

$outputDir = "C:\Trishna Projects\clozet\frontend"

foreach ($section in $sections) {
    $keyword = $section[0]
    $summary = $section[1]
    
    # Comment out the details section by replacing <details ...>...</details> with a comment
    $pattern = "(?s)<details className=""group"">\s*<summary[^>]*>\s*<span>$summary</span>.*?</details>"
    $replacement = "{/* $summary section commented out */}"
    
    $modified = $content -replace $pattern, $replacement
    
    $outputPath = Join-Path $outputDir "test-parse-no-$keyword.tsx"
    [System.IO.File]::WriteAllText($outputPath, $modified, [System.Text.Encoding]::UTF8)
    Write-Host "Created test-parse-no-$keyword.tsx"
}
