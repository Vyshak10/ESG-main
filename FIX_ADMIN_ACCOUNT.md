# FASTEST FIX - Change Your Account to Admin

## Option 1: Use MongoDB Shell (30 seconds)

Open a new PowerShell terminal and run:

```powershell
mongosh esg_analytics
```

Then paste this command (replace with YOUR email):

```javascript
db.users.updateOne(
  { email: "admin@test.com" },
  { $set: { role: "admin" } }
)
```

You should see: `{ acknowledged: true, modifiedCount: 1 }`

Then:
1. Go to http://localhost:3000
2. **Logout** (if logged in)
3. **Login again** with your credentials
4. You'll now go to Admin Dashboard!

---

## Option 2: Create New Admin Account

If MongoDB command doesn't work:

1. Go to http://localhost:3000/signup
2. Use a **DIFFERENT email**: myadmin@test.com
3. Fill the form
4. **IMPORTANT**: In the "Role" dropdown, select **"Admin (Upload & Manage)"**
5. Click Sign Up

---

## How to Verify You're Admin

After logging in, check:

✅ **URL should be**: `http://localhost:3000/admin/dashboard`
   (NOT just `/dashboard`)

✅ **Page title**: "ESG Analytics - **Admin Dashboard**"
   (NOT just "Dashboard")

✅ **Top right**: Shows "Your Name **(Admin)**"

✅ **You see**: "ADD COMPANY" button

---

## Why This Happened

During signup, there's a dropdown for "Role":
- **User (View Reports)** ← You selected this
- **Admin (Upload & Manage)** ← You need this

The system saved your account as "user" role, so when you login, it routes you to the user dashboard.

---

## Try Option 1 First!

It's the fastest - just run the MongoDB command and re-login!
