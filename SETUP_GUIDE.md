# ESG Analytics Platform - Quick Setup Guide

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.9+ installed (`python --version`)
- [ ] MongoDB installed and running
- [ ] Git installed

## Step-by-Step Setup

### 1. Install Python Dependencies

```powershell
cd python-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

### 2. Install Backend Dependencies

```powershell
cd ..\backend
npm install
copy .env.example .env
```

**Important**: Edit `backend\.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string

### 3. Install Frontend Dependencies

```powershell
cd ..\frontend
npm install
copy .env.example .env
```

### 4. Start All Services

From the root directory:

```powershell
.\start-all.ps1
```

Or start manually in separate terminals:

**Terminal 1 - Python Service:**
```powershell
cd python-service
venv\Scripts\activate
python main.py
```

**Terminal 2 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```powershell
cd frontend
npm start
```

### 5. Access the Application

Open your browser to: `http://localhost:3000`

## First Time Usage

1. **Sign Up** as an admin user
2. **Create a company** from the admin dashboard
3. **Upload a PDF** sustainability report
4. **View results** after processing (30-60 seconds)

## Common Issues

### MongoDB Not Running
```powershell
# Start MongoDB service
net start MongoDB
```

### Port Already in Use
- Frontend (3000): Change in `package.json`
- Backend (5000): Change in `backend\.env`
- Python (8000): Change in `python-service\.env`

### Python Virtual Environment Issues
```powershell
# Recreate virtual environment
cd python-service
rmdir /s venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Testing the System

Use the sample PDF reports in the `input/` folder or create a test company and upload any sustainability report PDF.

## Need Help?

Check `README_FULLSTACK.md` for detailed documentation.
