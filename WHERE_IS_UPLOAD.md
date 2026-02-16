# WHERE IS THE UPLOAD BUTTON? - Visual Guide

## You're Currently On: SIGNUP PAGE ❌
The signup page does NOT have upload functionality. This is just for creating your account.

---

## The Correct Workflow (Step-by-Step)

### Step 1: SIGNUP PAGE (Where you are now)
**URL**: http://localhost:3000/signup

**What you see**:
- Name field
- Email field  
- Password field
- **Role dropdown** ← SELECT "Admin (Upload & Manage)"
- Sign Up button

**Action**: Fill the form and click "Sign Up"

---

### Step 2: ADMIN DASHBOARD (After signup)
**URL**: http://localhost:3000/admin/dashboard

**What you'll see**:
```
┌─────────────────────────────────────────────────┐
│ ESG Analytics - Admin Dashboard    [LOGOUT]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Company Management          [ADD COMPANY] ←── │
│  Create companies and upload...                 │
│                                                 │
│  ℹ️ No companies yet. Click "Add Company"...   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Action**: Click "ADD COMPANY" button (top right)

---

### Step 3: CREATE COMPANY DIALOG
**What you'll see**: A popup form

```
┌──────────────────────────────┐
│  Add New Company             │
├──────────────────────────────┤
│  Company Name: [________]    │
│  Industry:     [________]    │
│  Description:  [________]    │
│  Website:      [________]    │
│                              │
│         [Cancel] [Create]    │
└──────────────────────────────┘
```

**Action**: 
- Enter: Microsoft
- Industry: Technology
- Click "Create"

---

### Step 4: COMPANY CARD WITH UPLOAD BUTTON ✅
**What you'll see**: Company card appears

```
┌─────────────────────────────────────┐
│  Microsoft                          │
│  [Technology]                       │
│                                     │
│  Global technology company...       │
│                                     │
│  Reports: 0                         │
│                                     │
│  [📤 UPLOAD REPORT] [✏️] [🗑️]  ←── HERE!
└─────────────────────────────────────┘
```

**Action**: Click "UPLOAD REPORT" button

---

### Step 5: UPLOAD PAGE
**URL**: http://localhost:3000/admin/upload/[companyId]

**What you'll see**:
```
┌─────────────────────────────────────┐
│  Upload Sustainability Report      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   📁 Click to select PDF file │ │
│  │   Maximum file size: 50MB     │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Upload and Analyze]               │
└─────────────────────────────────────┘
```

**Action**: 
- Click the box to select PDF
- Choose a PDF file
- Click "Upload and Analyze"

---

## IMPORTANT NOTES

### ❌ Common Mistakes:

1. **Signing up as "User" instead of "Admin"**
   - Users can only VIEW reports
   - Admins can UPLOAD reports
   - **Solution**: Make sure you select "Admin" role during signup!

2. **Looking for upload on signup page**
   - Upload is NOT on signup page
   - Upload is NOT on login page
   - Upload appears AFTER creating a company

3. **Not creating a company first**
   - You MUST create a company before uploading
   - Click "ADD COMPANY" on admin dashboard

---

## Quick Checklist

- [ ] I'm on signup page
- [ ] I selected **"Admin (Upload & Manage)"** role
- [ ] I clicked "Sign Up"
- [ ] I'm now on admin dashboard
- [ ] I see "ADD COMPANY" button
- [ ] I clicked it and created a company
- [ ] I now see company card with "UPLOAD REPORT" button ✅

---

## Still Don't See Upload Button?

### Check 1: Are you logged in as Admin?
Look at the top right of the page. Does it say:
- "Your Name (Admin)" ✅ Good!
- "Your Name" only ❌ You're a User, not Admin

**Fix**: Logout, signup again, select "Admin" role

### Check 2: Did you create a company?
Do you see:
- "No companies yet..." message ❌ No companies
- Company cards with names ✅ Companies exist

**Fix**: Click "ADD COMPANY" button

### Check 3: Are you on the right page?
Check the URL:
- `/signup` or `/login` ❌ Wrong page
- `/admin/dashboard` ✅ Correct page

---

## Summary

**Upload button location**: 
On the company card, AFTER you:
1. Sign up as Admin
2. Create a company

**It's NOT on**:
- ❌ Signup page
- ❌ Login page  
- ❌ User dashboard

**It IS on**:
- ✅ Admin dashboard (on company cards)
- ✅ Upload page (after clicking "Upload Report")
