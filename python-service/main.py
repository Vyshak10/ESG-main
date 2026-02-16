from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import tempfile
import logging
from datetime import datetime

from esg_analyzer import SimplifiedESGAnalyzer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ESG Analytics API",
    description="AI-powered ESG analysis for sustainability reports",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ESG analyzer
esg_analyzer = SimplifiedESGAnalyzer()

# Response models
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str

class AnalysisResponse(BaseModel):
    success: bool
    company_name: str
    scores: Dict[str, Any]
    greenwashing_risk: Dict[str, Any]
    insights: list
    total_segments_analyzed: int
    category_distribution: Dict[str, int]
    greenwashing_alerts: Optional[list] = None


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint"""
    return {
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "service": "ESG Analytics API"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "ESG Analytics API"
    }


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_report(
    file: UploadFile = File(..., description="PDF sustainability report"),
    company_name: str = Form(..., description="Company name")
):
    """
    Analyze a PDF sustainability report and generate ESG scores
    
    Args:
        file: PDF file upload
        company_name: Name of the company
    
    Returns:
        Complete ESG analysis with scores and greenwashing detection
    """
    logger.info(f"Received analysis request for company: {company_name}")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    # Create temporary file to store upload
    temp_file = None
    try:
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        logger.info(f"Saved PDF to temporary file: {temp_path}")
        
        # Run ESG analysis
        logger.info("Starting ESG analysis...")
        result = esg_analyzer.analyze_document(temp_path, company_name)
        
        if "error" in result:
            logger.error(f"Analysis error: {result['error']}")
            raise HTTPException(
                status_code=500,
                detail=result['error']
            )
        
        logger.info(f"Analysis complete. Total score: {result['scores']['total_esg_score']}")
        
        return {
            "success": True,
            **result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
                logger.info("Cleaned up temporary file")
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")


@app.get("/stats")
async def get_stats():
    """Get API statistics"""
    return {
        "service": "ESG Analytics API",
        "version": "1.0.0",
        "features": [
            "PDF text extraction",
            "ESG classification (Environmental, Social, Governance)",
            "Sentiment analysis",
            "Greenwashing detection with ChromaDB",
            "Quantitative metrics extraction",
            "Comprehensive scoring"
        ],
        "supported_formats": ["PDF"]
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
