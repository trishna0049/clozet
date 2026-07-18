$ErrorActionPreference = "Stop"
$path = "C:\Trishna Projects\clozet\frontend\src\components\products-page-content.tsx"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$returnStart = $content.IndexOf("return (")
$returnEnd = $content.LastIndexOf(");") + 2
$beforeReturn = $content.Substring(0, $returnStart)
$afterReturn = $content.Substring($returnEnd)

# Test 4: Add price details
$test4Return = @"
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

            <details className="group">
              <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa">
                <span>Price</span>
                <span className="text-cocoa/60 text-xs">${priceRange[0]} - ${priceRange[1]}</span>
              </summary>
              <div className="mt-2 px-3 pb-4 space-y-4 text-sm text-cocoa/72">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="number"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full px-3 py-2 border border-cocoa/30 rounded text-sm"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full px-3 py-2 border border-cocoa/30 rounded text-sm"
                    placeholder="Max"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
"@
[System.IO.File]::WriteAllText("$pwd\test-parse-simple4.tsx", $beforeReturn + $test4Return + $afterReturn, [System.Text.Encoding]::UTF8)
Write-Host "Created test-parse-simple4.tsx"
