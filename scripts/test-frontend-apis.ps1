# ZEMO Frontend Testing Script

## After deployment completes (wait 1-2 minutes), test these endpoints:

Write-Host "🧪 Testing ZEMO Frontend APIs..." -ForegroundColor Cyan
Write-Host ""

# 1. Test vehicle search API
Write-Host "1️⃣ Testing Vehicle Search API..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app/api/vehicles/search" -Method GET -UseBasicParsing
    $vehicleCount = $searchResponse.vehicles.Count
    Write-Host "   ✅ Found $vehicleCount vehicles" -ForegroundColor Green
    
    if ($vehicleCount -gt 0) {
        Write-Host "   📋 Vehicle list:" -ForegroundColor Cyan
        foreach ($vehicle in $searchResponse.vehicles) {
            Write-Host "      - $($vehicle.year) $($vehicle.make) $($vehicle.model) (ZMW $($vehicle.dailyRate)/day)" -ForegroundColor White
        }
    } else {
        Write-Host "   ❌ No vehicles found - check database" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Search API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Test general vehicles API
Write-Host "2️⃣ Testing General Vehicles API..." -ForegroundColor Yellow
try {
    $vehiclesResponse = Invoke-RestMethod -Uri "https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app/api/vehicles" -Method GET -UseBasicParsing
    Write-Host "   ✅ Vehicles API responded" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Vehicles API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Test health check
Write-Host "3️⃣ Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app/api/health" -Method GET -UseBasicParsing
    Write-Host "   ✅ Status: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "   ✅ Database: $($healthResponse.database)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ API Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app/search in browser"
Write-Host "2. Verify 4 vehicles display"
Write-Host "3. Test search filters"
Write-Host "4. Click on a vehicle to view details"
Write-Host "5. Test booking flow"
Write-Host ""
