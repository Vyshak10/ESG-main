# ESG Analytics Platform - Full Stack Application

A comprehensive ESG (Environmental, Social, Governance) analytics platform that uses AI to analyze sustainability reports and detect greenwashing. Built with React, Node.js, MongoDB, and Python FastAPI.

## 🌟 Features

### For Users
- **View All Companies**: Browse all companies with their ESG scores
- **Detailed Dashboards**: View comprehensive ESG analysis for each company
- **Visual Analytics**: Interactive charts showing Environmental, Social, and Governance scores
- **Greenwashing Detection**: AI-powered detection of misleading sustainability claims
- **Search & Filter**: Find companies by name or industry

### For Admins
- **Company Management**: Create, update, and delete companies
- **Report Upload**: Upload PDF sustainability reports
- **AI Processing**: Automatic ESG analysis using machine learning
- **Score Generation**: Automated calculation of ESG scores
- **Vector-Based Analysis**: ChromaDB-powered semantic greenwashing detection

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Material-UI)
│   Port: 3000    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Node.js Backend │ (Express + MongoDB)
│   Port: 5000    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Python FastAPI  │ (ESG Analysis + ChromaDB)
│   Port: 8000    │
└─────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **MongoDB** 4.4+ (local or MongoDB Atlas)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd d:\python\ESG\DotChallengeROUND1A
```

### 2. Setup Python FastAPI Service

```bash
cd python-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Start the service
python main.py
```

The Python service will run on `http://localhost:8000`

### 3. Setup Node.js Backend

Open a new terminal:

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env and configure:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (a secure random string)

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Setup React Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

## 📝 Usage Guide

### First Time Setup

1. **Start all services** (Python, Node.js, React)
2. **Open browser** to `http://localhost:3000`
3. **Sign up** as an admin user
4. **Create a company** from the admin dashboard
5. **Upload a PDF** sustainability report
6. **Wait for processing** (30-60 seconds)
7. **View the results** on the company detail page

### User Workflow

1. Sign up/Login as a **user**
2. Browse all companies on the dashboard
3. Click on any company to view detailed ESG analysis
4. See Environmental, Social, and Governance scores
5. Review greenwashing risk assessment
6. Explore interactive charts and insights

### Admin Workflow

1. Sign up/Login as an **admin**
2. Create new companies with details
3. Click "Upload Report" on any company card
4. Select and upload a PDF sustainability report
5. System automatically:
   - Extracts text from PDF
   - Classifies content into E, S, G categories
   - Analyzes sentiment and metrics
   - Detects greenwashing using ChromaDB
   - Calculates scores
6. View generated dashboard with all scores

## 🗂️ Project Structure

```
DotChallengeROUND1A/
├── python-service/          # Python FastAPI service
│   ├── main.py             # FastAPI app
│   ├── esg_analyzer.py     # Enhanced ESG analyzer
│   ├── vector_store.py     # ChromaDB integration
│   └── requirements.txt    # Python dependencies
├── backend/                # Node.js Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Auth middleware
│   └── server.js          # Express server
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── services/     # API services
│   │   └── App.js        # Main app
│   └── package.json
└── src/                   # Original ESG model
    └── esg_core_ai.py    # Core ESG logic
```

## 🔧 Configuration

### MongoDB Setup

**Option 1: Local MongoDB**
```
MONGODB_URI=mongodb://localhost:27017/esg_analytics
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` in backend folder

### Environment Variables

**Python Service** (`python-service/.env`):
```
PORT=8000
HOST=0.0.0.0
CHROMA_PERSIST_DIR=./chroma_db
LOG_LEVEL=INFO
```

**Backend** (`backend/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/esg_analytics
JWT_SECRET=your_secure_secret_key
PYTHON_SERVICE_URL=http://localhost:8000
```

**Frontend** (`frontend/.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Testing the System

### Test with Sample Data

1. Create a test company:
   - Name: "Microsoft"
   - Industry: "Technology"
   - Description: "Global technology company"

2. Upload a sustainability report PDF

3. Expected results:
   - Overall ESG Score: 0-100
   - Environmental Score: 0-100
   - Social Score: 0-100
   - Governance Score: 0-100
   - Greenwashing Risk: Low/Medium/High

## 🎯 Key Technologies

### Frontend
- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing

### Python Service
- **FastAPI** - Modern Python web framework
- **PyMuPDF** - PDF text extraction
- **ChromaDB** - Vector database
- **TextBlob** - Sentiment analysis
- **Transformers** - NLP models

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (User/Admin)
- Protected API routes
- File type validation
- File size limits

## 📊 ESG Scoring Methodology

1. **Text Extraction**: Extract text from PDF reports
2. **Classification**: Categorize content into E, S, G
3. **Sentiment Analysis**: Analyze tone and subjectivity
4. **Metrics Extraction**: Identify quantitative data
5. **Greenwashing Detection**: 
   - Rule-based pattern matching
   - Vector similarity with ChromaDB
   - Combined risk scoring
6. **Score Calculation**: Weighted average of all factors

## 🐛 Troubleshooting

### Python Service Won't Start
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Backend Connection Error
```bash
# Check MongoDB is running
# Windows: Check Services
# Linux: sudo systemctl status mongod

# Test MongoDB connection
mongosh
```

### Frontend API Errors
- Ensure backend is running on port 5000
- Check `.env` file has correct API URL
- Verify CORS is enabled in backend

### PDF Upload Fails
- Check file is PDF format
- Ensure file size < 50MB
- Verify Python service is running
- Check backend logs for errors

## 📈 Future Enhancements

- Historical trend analysis
- Company comparisons
- Export reports to PDF
- Email notifications
- Multi-language support
- Advanced analytics dashboard
- API rate limiting
- Caching layer

## 🤝 Contributing

This is a demonstration project for ESG analytics. Feel free to fork and enhance!

## 📄 License

MIT License

## 👥 Support

For questions or issues, please check the troubleshooting section or review the code documentation.

---

**Built with ❤️ using React, Node.js, MongoDB, and Python FastAPI**
