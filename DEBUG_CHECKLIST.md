# Debug Checklist - Please Answer These Questions

Please help me understand what you're seeing:

## 1. What URL are you currently on?
- [ ] http://localhost:3000/login
- [ ] http://localhost:3000/signup  
- [ ] http://localhost:3000/dashboard
- [ ] http://localhost:3000/admin/dashboard
- [ ] Other: _______________

## 2. Are you logged in?
- [ ] Yes, as User
- [ ] Yes, as Admin
- [ ] No, not logged in

## 3. What do you see on the screen?
- [ ] Login/Signup form
- [ ] Empty dashboard with "No companies" message
- [ ] Dashboard with one card showing "Unknown Company"
- [ ] Dashboard with company cards but no "Upload Report" button
- [ ] Other: _______________

## 4. If you're on the dashboard, do you see:
- [ ] "ADD COMPANY" button (top right)
- [ ] Search bar
- [ ] Company cards
- [ ] Just an empty card with no name

## 5. Open Browser Console (F12) and check:
- [ ] Are there any red error messages?
- [ ] What does it say? _______________

## 6. Can you take a screenshot?
Press Windows+Shift+S and paste here, or describe exactly what's on screen.

---

## Quick Diagnostic Commands

Run these in PowerShell and tell me the results:

```powershell
# Test if backend is working
curl http://localhost:5000/api/companies

# This should return JSON with companies list
```

```powershell
# Check if you can create a company
# (Replace YOUR_TOKEN with actual token from browser)
curl -X POST http://localhost:5000/api/companies `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{"name":"Test Company","industry":"Technology"}'
```

---

## Most Likely Issues:

### Issue 1: Not logged in as Admin
**Symptom**: You see companies but no "Upload Report" button
**Fix**: Logout, signup again, select role = "Admin"

### Issue 2: No companies created
**Symptom**: Empty dashboard or "Unknown Company" card
**Fix**: Click "ADD COMPANY" button (only visible to admins)

### Issue 3: Frontend not connecting to backend
**Symptom**: Empty screen, no data loading
**Fix**: Check browser console for errors

### Issue 4: MongoDB not connected
**Symptom**: Can't create companies, errors when signing up
**Fix**: Start MongoDB service

---

Please answer the questions above so I can give you the exact fix!
