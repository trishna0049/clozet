$ErrorActionPreference = "Stop"
$path = "C:\Trishna Projects\clozet\frontend\src\components\products-page-content.tsx"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Find the return statement and extract the different sections
# Strategy: replace different parts of the JSX to find the problematic one

# Section 1: Replace the filter details section (lines around 255-447)
$modified1 = $content -replace '(?s)(<div className="rounded-\[1\.5rem\]).*?(</details>\s*\)\s*</div>\s*</div>)', '$1...REPLACED...$2'

Write-Host "Modified length: $($modified1.Length)"
