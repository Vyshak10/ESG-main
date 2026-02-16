# Quick Start - Create Your First Company and Upload Report

## The Issue
You're seeing an empty card because **no companies have been created yet**. You need to create a company first before you can upload reports.

---

## Step-by-Step Solution

### Step 1: Sign Up as Admin

1. Open http://localhost:3000
2. Click "Sign up"
3. Fill in the form:
   - **Name**: Your name
   - **Email**: your@email.com
   - **Password**: (at least 6 characters)
   - **Role**: Select **Admin** (very important!)
4. Click "Sign Up"

You should be redirected to the **Admin Dashboard**.

---

### Step 2: Create a Company

On the Admin Dashboard, you should see:
- A button "**ADD COMPANY**" in the top right
- Text saying "No companies yet. Click Add Company..."

**Click the "ADD COMPANY" button**, then fill in:
- **Company Name**: Microsoft (or any company name)
- **Industry**: Technology
- **Description**: (optional) Global technology company
- **Website**: (optional) https://www.microsoft.com

Click "**CREATE**"

---

### Step 3: Upload a PDF Report

Now you should see a company card with:
- Company name
- Industry chip
- "**UPLOAD REPORT**" button

**Click "UPLOAD REPORT"**, then:
1. Click the upload area or "Click to select PDF file"
2. Choose a PDF sustainability report from your computer
3. Click "**Upload and Analyze**"
4. Wait 30-60 seconds for processing

---

### Step 4: View Results

After processing, you'll be redirected to the company dashboard showing:
- ✅ Overall ESG Score
- ✅ Environmental, Social, Governance scores
- ✅ Greenwashing risk assessment
- ✅ Interactive charts

---

## Troubleshooting

### "I don't see the ADD COMPANY button"
**Solution**: You signed up as "User" instead of "Admin"
- Logout (top right)
- Sign up again with role = **Admin**

### "I see the company but no UPLOAD REPORT button"
**Solution**: You're logged in as "User"
- Users can only **view** reports
- Admins can **upload** reports
- Logout and login as Admin

### "The upload button doesn't work"
**Solution**: Check browser console (F12)
- Look for error messages
- Make sure all 3 services are running
- MongoDB must be connected

---

## Quick Test

**Don't have a PDF?** Use any PDF file from your computer, or:
1. Download a sample sustainability report from any company website
2. Or use any PDF document temporarily for testing

The system will analyze any PDF, but sustainability reports give the best results!

---

## Current Status Check

Run this to verify everything is working:
```powershell
.\test-services.ps1
```

All three should show ✅:
- Python Service
- Backend API  
- Frontend

---

## Summary

**The correct flow is:**
1. Sign up as **Admin** ← You must select Admin role!
2. Create a company ← Click "ADD COMPANY" button
3. Upload PDF ← Click "UPLOAD REPORT" on company card
4. View results ← Automatic redirect after processing

**Current issue**: No companies created yet, so nothing to upload to!
