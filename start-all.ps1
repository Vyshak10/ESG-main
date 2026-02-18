# Start all services for ESG Analytics Platform

Write-Host "Starting ESG Analytics Platform..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($null -eq $mongoProcess) {
    Write-Host "Warning: MongoDB doesn't appear to be running!" -ForegroundColor Red
    Write-Host "Please start MongoDB before continuing." -ForegroundColor Red
    Write-Host ""
}

# Start Python FastAPI Service
Write-Host "Starting Python FastAPI Service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd python-service; .\venv\Scripts\python.exe main.py"
Start-Sleep -Seconds 3

# Start Node.js Backend
Write-Host "Starting Node.js Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Sleep -Seconds 3

# Start React Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host ""
Write-Host "All services starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Services will be available at:" -ForegroundColor Yellow
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "  Python:    http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop services" -ForegroundColor Yellow
