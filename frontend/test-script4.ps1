$ErrorActionPreference = "Stop"
$path = "C:\Trishna Projects\clozet\frontend\src\components\products-page-content.tsx"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$returnStart = $content.IndexOf("return (")
$returnEnd = $content.LastIndexOf(");") + 2
$beforeReturn = $content.Substring(0, $returnStart)
$returnContent = $content.Substring($returnStart, $returnEnd - $returnStart)
$afterReturn = $content.Substring($returnEnd)

# Test 2: Include the searchTerm conditional
$test2Return = @"
return (
    <div className="space-y-8 pb-8" suppressHydrationWarning>
      {searchTerm.trim().length > 0 && (
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-soft text-sm text-cocoa/80">
          Showing results for <span className="font-semibold text-cocoa">"{searchTerm.trim()}"</span>
        </div>
      )}
      <div className="space-y-8">
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-3 text-sm">
          </div>
        </div>
      </div>
    </div>
  );
"@
[System.IO.File]::WriteAllText("$pwd\test-parse-simple2.tsx", $beforeReturn + $test2Return + $afterReturn, [System.Text.Encoding]::UTF8)
Write-Host "Created test-parse-simple2.tsx"

# Test 3: Add the sort dropdown
$test3Return = @"
return (
    <div className="space-y-8 pb-8" suppressHydrationWarning>
      {searchTerm.trim().length > 0 && (
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-soft text-sm text-cocoa/80">
          Showing results for <span className="font-semibold text-cocoa">"{searchTerm.trim()}"</span>
        </div>
      )}
      <div className="space-y-8">
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium text-cocoa">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-cocoa/30 rounded text-sm text-cocoa bg-white"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
"@
[System.IO.File]::WriteAllText("$pwd\test-parse-simple3.tsx", $beforeReturn + $test3Return + $afterReturn, [System.Text.Encoding]::UTF8)
Write-Host "Created test-parse-simple3.tsx"
