"""
Smart ESG Analytics Engine
Connects the UI to the Custom Trained ML Model (esg_model.pkl)
"""

import sys
import os
import logging
import joblib
import fitz  # PyMuPDF
import re
import numpy as np
from typing import Dict, List, Any

# --- CRITICAL: Import sklearn components so joblib knows what to load ---
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# Setup paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.append(BASE_DIR)

logger = logging.getLogger(__name__)

class SimplifiedESGAnalyzer:
    """
    Wrapper class that looks like the old analyzer but uses the SMART ML model.
    """
    
    def __init__(self):
        # 1. Locate the model file
        self.model_path = os.path.join(BASE_DIR, 'training', 'esg_model.pkl')
        self.model = None
        
        # 2. Load the trained brain
        self._load_model()
        
    def _load_model(self):
        """Loads the .pkl file created by custom_esg_trainer.py"""
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                logger.info(f"✅ SUCCESSFULLY LOADED ML MODEL from {self.model_path}")
            except Exception as e:
                logger.error(f"❌ FAILED TO LOAD MODEL: {e}")
                self.model = None
        else:
            logger.warning(f"⚠️ Model file not found at {self.model_path}. Analysis will be limited.")

    def detect_tense(self, text: str) -> str:
        """Determines if a sentence is a Promise (Weak) or Action (Strong)"""
        text_lower = text.lower()
        future_keywords = ["will", "aim", "target", "plan", "commit", "roadmap", "goal", "by 2030", "intend"]
        action_keywords = ["achieved", "reduced", "decreased", "increased", "completed", "delivered", "saved"]
        
        if any(w in text_lower for w in action_keywords): return "Action"
        if any(w in text_lower for w in future_keywords): return "Promise"
        return "Neutral"

    def analyze_document(self, pdf_path: str, company_name: str = "Unknown") -> Dict[str, Any]:
        """
        The main function called by your UI.
        """
        logger.info(f"🧠 ML Analysis started for: {company_name}")
        
        if not self.model:
            return {"error": "ML Model not loaded. Please run custom_esg_trainer.py first."}

        # Initialize counters
        results = {
            "Environmental": 0, "Social": 0, "Governance": 0,
            "Action": 0, "Promise": 0,
            "evidence": []
        }
        
        total_segments_count = 0

        try:
            # 1. Read PDF
            doc = fitz.open(pdf_path)
            
            for page_num, page in enumerate(doc):
                text = page.get_text()
                
                # Split into sentences
                sentences = re.split(r'[.!?]\s+', text)
                
                for sentence in sentences:
                    cleaned = sentence.strip()
                    if len(cleaned) > 25: # Ignore tiny fragments
                        
                        # 2. ML PREDICTION
                        category = self.model.predict([cleaned])[0]
                        probs = self.model.predict_proba([cleaned])[0]
                        confidence = float(np.max(probs))

                        if category in ["Environmental", "Social", "Governance"]:
                            total_segments_count += 1
                            results[category] += 1
                            
                            # 3. TENSE DETECTION
                            tense = self.detect_tense(cleaned)
                            if tense == "Action": results["Action"] += 1
                            if tense == "Promise": results["Promise"] += 1

                            # Save high-quality evidence for the UI
                            if len(results["evidence"]) < 20:  # Limit to top 20 snippets
                                results["evidence"].append({
                                    "text": cleaned[:200] + "...",
                                    "category": category,
                                    "type": tense,
                                    "page": page_num + 1
                                })

            # 4. CALCULATE SCORES (0-100) - IMPROVED FORMULA
            total_relevant = results["Environmental"] + results["Social"] + results["Governance"]
            
            if total_relevant > 0:
                # Calculate base scores from segment counts
                # Use logarithmic scaling to reward finding segments while not over-penalizing low counts
                env_count = results["Environmental"]
                soc_count = results["Social"]
                gov_count = results["Governance"]
                
                # Score formula: Base score from count + bonus from proportion
                # This ensures even categories with few segments get reasonable scores
                def calculate_score(count, total):
                    if count == 0:
                        return 0
                    # Base score from count (0-70 range)
                    base_score = min(count * 3.5, 70)
                    # Bonus from proportion (0-30 range)
                    proportion_bonus = (count / total) * 30
                    return min(round(base_score + proportion_bonus), 95)
                
                env_score = calculate_score(env_count, total_relevant)
                soc_score = calculate_score(soc_count, total_relevant)
                gov_score = calculate_score(gov_count, total_relevant)
            else:
                env_score, soc_score, gov_score = 0, 0, 0
                
            total_esg_score = round((env_score + soc_score + gov_score) / 3)

            # 5. DETECT GREENWASHING
            gw_risk_level = "Low"
            gw_description = "Healthy balance of actions and promises."
            gw_score = 10

            if results["Action"] == 0 and results["Promise"] > 5:
                gw_risk_level = "High"
                gw_description = "CRITICAL: Many promises made but ZERO actions detected."
                gw_score = 90
            elif results["Action"] > 0 and (results["Promise"] / results["Action"]) > 3:
                gw_risk_level = "Medium"
                gw_description = "Warning: Company makes significantly more promises than it delivers."
                gw_score = 65

            # 6. GENERATE INSIGHTS
            insights = []
            if env_score > 70: insights.append("✅ Strong Environmental focus detected.")
            if results["Promise"] > 20: insights.append(f"ℹ️ High ambition: {results['Promise']} future targets identified.")
            if gw_risk_level == "High": insights.append("⚠️ FLAG: Potential Greenwashing detected (Ambition Gap).")

            # 7. FORMAT FOR UI
            response = {
                "company_name": company_name,
                "scores": {
                    "total_esg_score": total_esg_score,
                    "dimension_scores": {
                        "Environmental": env_score,
                        "Social": soc_score,
                        "Governance": gov_score
                    }
                },
                "greenwashing_risk": {
                    "level": gw_risk_level,
                    "score": gw_score,
                    "description": gw_description,
                    "alert_count": results["Promise"]
                },
                "greenwashing_alerts": results["evidence"],
                "insights": insights,
                "total_segments_analyzed": total_segments_count,
                "category_distribution": {
                    "Environmental": results["Environmental"],
                    "Social": results["Social"],
                    "Governance": results["Governance"]
                }
            }
            
            logger.info("✅ Analysis Complete. Sending JSON to UI.")
            return response

        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return {"error": str(e)}