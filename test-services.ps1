# Quick Test Script - Test PDF Upload

Write-Host "Testing ESG Analytics Platform Services..." -ForegroundColor Cyan
Write-Host ""

# Test Python Service
Write-Host "1. Testing Python FastAPI Service (Port 8000)..." -ForegroundColor Yellow
try {
    $pythonHealth = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
    Write-Host "   ✅ Python Service: $($pythonHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python Service: NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test Backend
Write-Host "2. Testing Node.js Backend (Port 5000)..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
    Write-Host "   ✅ Backend API: Running" -ForegroundColor Green
    Write-Host "   Version: $($backendHealth.version)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend: NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test Frontend
Write-Host "3. Testing React Frontend (Port 3000)..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -UseBasicParsing
    if ($frontend.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend: Running" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Frontend: NOT RESPONDING" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Instructions
Write-Host "Next Steps to Test PDF Upload:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open browser to: http://localhost:3000" -ForegroundColor White
Write-Host "2. Sign up as ADMIN" -ForegroundColor White
Write-Host "3. Create a company" -ForegroundColor White
Write-Host "4. Click 'Upload Report'" -ForegroundColor White
Write-Host "5. Select a PDF file" -ForegroundColor White
Write-Host "6. Click 'Upload and Analyze'" -ForegroundColor White
Write-Host ""
Write-Host "If upload fails, check:" -ForegroundColor Yellow
Write-Host "- Backend terminal for error messages" -ForegroundColor Gray
Write-Host "- Python service terminal for processing logs" -ForegroundColor Gray
Write-Host "- Browser console (F12) for frontend errors" -ForegroundColor Gray
Write-Host ""
