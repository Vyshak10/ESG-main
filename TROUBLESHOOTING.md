# PDF Upload Troubleshooting Guide

## How to Debug the Upload Issue

### Step 1: Open Browser Console
1. Open http://localhost:3000 in your browser
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab

### Step 2: Try to Upload
1. Sign up/login as **Admin**
2. Create a company (if not already done)
3. Click "Upload Report"
4. Select a PDF file
5. Click "Upload and Analyze"

### Step 3: Check Console for Errors
Look for messages starting with:
- "Starting upload for company:"
- "Upload error:"
- "Error response:"

**Copy the entire error message** and check below for solutions.

---

## Common Errors and Solutions

### Error: "Network Error" or "ERR_CONNECTION_REFUSED"
**Cause**: Backend is not running or not accessible

**Solution**:
```powershell
# Check if backend is running
curl http://localhost:5000/

# If not responding, restart backend
cd backend
npm run dev
```

---

### Error: "Request failed with status code 401"
**Cause**: Not logged in or token expired

**Solution**:
1. Logout and login again
2. Make sure you signed up as **Admin** (not User)

---

### Error: "Request failed with status code 404"
**Cause**: Company ID not found or route issue

**Solution**:
1. Check the URL - should be `/admin/upload/{companyId}`
2. Make sure the company exists
3. Try creating a new company

---

### Error: "Request failed with status code 500"
**Cause**: Server error (check backend terminal)

**Check Backend Terminal** for errors like:
- MongoDB connection error
- Python service not responding
- File system permissions

**Solutions**:
```powershell
# 1. Check MongoDB is running
mongosh

# 2. Check Python service
curl http://localhost:8000/health

# 3. Check backend logs in terminal
```

---

### Error: "Python service is currently unavailable"
**Cause**: Python FastAPI service not running

**Solution**:
```powershell
# Restart Python service
cd python-service
python main.py
```

---

### Error: "Only PDF files are supported"
**Cause**: Wrong file type selected

**Solution**:
- Make sure you're selecting a **.pdf** file
- Not .docx, .txt, or other formats

---

### Error: "File size must be less than 50MB"
**Cause**: PDF file too large

**Solution**:
- Use a smaller PDF file
- Or compress the PDF first

---

## Manual Test

### Test Backend Directly
```powershell
# Test if backend can receive files
curl -X POST http://localhost:5000/api/reports/upload `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -F "report=@C:\path\to\your\file.pdf" `
  -F "companyId=YOUR_COMPANY_ID"
```

### Test Python Service Directly
```powershell
# Test if Python service can analyze PDFs
curl -X POST http://localhost:8000/analyze `
  -F "file=@C:\path\to\your\file.pdf" `
  -F "company_name=TestCompany"
```

---

## Still Not Working?

### Collect This Information:

1. **Browser Console Error** (F12 → Console tab)
2. **Backend Terminal Output** (look for errors)
3. **Python Service Terminal Output** (look for errors)
4. **Network Tab** (F12 → Network tab → look for failed requests)

### Check These:

- [ ] All 3 services running (Python, Backend, Frontend)
- [ ] MongoDB is running and connected
- [ ] Logged in as **Admin** (not User)
- [ ] Company exists
- [ ] PDF file is valid and < 50MB
- [ ] No firewall blocking localhost ports

---

## Quick Reset

If nothing works, try this:

```powershell
# Stop all services (Ctrl+C in each terminal)

# Restart in order:
# Terminal 1 - Python
cd python-service
python main.py

# Terminal 2 - Backend  
cd backend
npm run dev

# Terminal 3 - Frontend
cd frontend
npm start

# Then try upload again
```
