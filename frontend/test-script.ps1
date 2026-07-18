$ErrorActionPreference = "Stop"
$path = "C:\Trishna Projects\clozet\frontend\src\components\products-page-content.tsx"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$lines = $content -split "`r`n"
$finalLines = @()
$inReturn = $false
foreach ($line in $lines) {
    if ($line -match '^\s+return \($') {
        $inReturn = $true
    } elseif ($inReturn -and $line -match '^\s+\);\s*$') {
        $inReturn = $false
        $finalLines += "    return (<div>test</div>);"
    } elseif ($inReturn) {
        # skip JSX in return
    } else {
        $finalLines += $line
    }
}
[System.IO.File]::WriteAllText("$pwd\test-parse-simplereturn.tsx", ($finalLines -join "`r`n"), [System.Text.Encoding]::UTF8)
Write-Host "Created $($finalLines.Count) lines"
