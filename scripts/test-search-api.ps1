# Test Frontend Search API
# Run this after deployment completes

Write-Host "Testing ZEMO Vehicle Search API..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app"

# Test 1: Simple search with no filters
Write-Host "Test 1: Simple search (no filters)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vehicles/search" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Vehicles found: $($data.vehicles.Count)" -ForegroundColor Green
    if ($data.vehicles.Count -gt 0) {
        $data.vehicles | ForEach-Object {
            Write-Host "   - $($_.year) $($_.make) $($_.model) (ZMW $($_.dailyRate)/day)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Search with location
Write-Host "Test 2: Search with location filter" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vehicles/search?location=Lusaka" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Vehicles found: $($data.vehicles.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Search with price range
Write-Host "Test 3: Search with price range (300-600)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vehicles/search?minPrice=300&maxPrice=600" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Vehicles found: $($data.vehicles.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Search with vehicle type
Write-Host "Test 4: Search with vehicle type (SEDAN)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vehicles/search?vehicleType=SEDAN" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Vehicles found: $($data.vehicles.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Search with dates
Write-Host "Test 5: Search with dates" -ForegroundColor Yellow
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$nextWeek = (Get-Date).AddDays(8).ToString("yyyy-MM-dd")
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/vehicles/search?startDate=$tomorrow&endDate=$nextWeek" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Vehicles found: $($data.vehicles.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing complete!" -ForegroundColor Cyan
