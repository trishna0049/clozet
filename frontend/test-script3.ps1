$ErrorActionPreference = "Stop"
$path = "C:\Trishna Projects\clozet\frontend\src\components\products-page-content.tsx"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Strategy: Split the return JSX into parts and test each
# The return starts with "return (" and ends with ");"

$returnStart = $content.IndexOf("return (")
$returnEnd = $content.LastIndexOf(");") + 2

if ($returnStart -eq -1 -or $returnEnd -eq -1) {
    Write-Host "Could not find return statement"
    exit 1
}

$beforeReturn = $content.Substring(0, $returnStart)
$returnContent = $content.Substring($returnStart, $returnEnd - $returnStart)
$afterReturn = $content.Substring($returnEnd)

# Test 1: Only include up to the searchTerm conditional (half the JSX)
$simplifiedReturn = @"
return (
    <div className="space-y-8 pb-8" suppressHydrationWarning>
      <div className="space-y-8">
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-3 text-sm">
          </div>
        </div>
      </div>
    </div>
  );
"@

$test1 = $beforeReturn + $simplifiedReturn + $afterReturn
[System.IO.File]::WriteAllText("$pwd\test-parse-simple1.tsx", $test1, [System.Text.Encoding]::UTF8)

Write-Host "Created test-parse-simple1.tsx"
