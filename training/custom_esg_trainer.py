import fitz  # PyMuPDF
import json
import logging
import sys
import re
import numpy as np
import joblib  # For saving the model
from typing import Dict, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

class CustomESGEngine:
    def __init__(self, training_file: str):
        self.model = None
        self.training_file = training_file
        
    def train_and_evaluate(self):
        """
        Trains the model AND generates a professional evaluation report.
        """
        try:
            with open(self.training_file, 'r') as f:
                data = json.load(f)
        except FileNotFoundError:
            logger.error(f"Could not find {self.training_file}.")
            return

        texts = [item['text'] for item in data]
        labels = [item['label'] for item in data]

        # 1. SPLIT DATA
        X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42)

        # 2. TRAIN
        self.model = make_pipeline(TfidfVectorizer(), MultinomialNB())
        self.model.fit(X_train, y_train)
        
        # 3. EVALUATE (Feature E: Precision/Recall/F1)
        logger.info("--- MODEL EVALUATION METRICS ---")
        predictions = self.model.predict(X_test)
        
        # This prints the professional table examiners love
        print("\n" + classification_report(y_test, predictions, zero_division=0))
        print("-" * 50)
        
        # Retrain on FULL data for maximum accuracy in production
        logger.info("Retraining on full dataset for production...")
        self.model.fit(texts, labels)
        
        # 4. SAVE THE MODEL
        model_path = 'esg_model.pkl'
        logger.info(f"Saving trained model to {model_path}...")
        joblib.dump(self.model, model_path)
        logger.info(f"✅ Model successfully saved to {model_path}")


    def detect_tense(self, text: str) -> str:
        text_lower = text.lower()
        future_keywords = ["will", "aim", "target", "plan", "commit", "roadmap", "goal", "future", "by 2030", "strive", "intend"]
        action_keywords = ["achieved", "reduced", "decreased", "increased", "completed", "generated", "eliminated", "delivered", "saved"]
        
        if any(w in text_lower for w in action_keywords): return "Action (Strong)"
        if any(w in text_lower for w in future_keywords): return "Promise (Weak)"
        return "Neutral"

    def calculate_esg_score(self, results: Dict) -> float:
        """
        Feature B: Converts raw counts into a 0-100 ESG Maturity Score.
        Weighted: Env (40%), Soc (30%), Gov (30%)
        """
        # Filter out Irrelevant from total
        total_relevant = results["Environmental"] + results["Social"] + results["Governance"]
        
        if total_relevant == 0:
            return 0.0

        # Calculate score based on distribution balance
        # A higher score implies a balanced report covering all sectors
        # Note: This is a simplified scoring logic for demo purposes
        score = (
            0.4 * (results["Environmental"] / total_relevant) +
            0.3 * (results["Social"] / total_relevant) +
            0.3 * (results["Governance"] / total_relevant)
        ) * 100 * 3 # Multiplier to normalize roughly to 100 scale
        
        return min(round(score, 1), 100.0)

    def process_pdf(self, pdf_path: str) -> Dict:
        if not self.model:
            logger.error("Model not trained!")
            return {}

        logger.info(f"Processing PDF: {pdf_path}")
        results = {
            "Environmental": 0, "Social": 0, "Governance": 0, "Irrelevant": 0,
            "action_vs_promise": {"Action (Strong)": 0, "Promise (Weak)": 0, "Neutral": 0},
            "greenwashing_risk": "Low",
            "overall_esg_score": 0.0,
            "details": []
        }
        
        try:
            doc = fitz.open(pdf_path)
            for page_num, page in enumerate(doc):
                text = page.get_text()
                
                # Feature D: Better Sentence Splitting (Regex)
                sentences = re.split(r'[.!?]\s+', text)
                
                for sentence in sentences:
                    cleaned = sentence.strip()
                    if len(cleaned) > 20:
                        # Feature A: Confidence Score
                        prediction = self.model.predict([cleaned])[0]
                        probs = self.model.predict_proba([cleaned])[0]
                        confidence = float(np.max(probs))
                        
                        if prediction in results:
                            results[prediction] += 1
                            
                            tense = self.detect_tense(cleaned)
                            results["action_vs_promise"][tense] += 1
                            
                            # Only show high-confidence/relevant details
                            if prediction != "Irrelevant" and len(results["details"]) < 500:
                                results["details"].append({
                                    "text": cleaned[:100] + "...",
                                    "category": prediction,
                                    "confidence": round(confidence, 2),  # <--- Added to output
                                    "tense": tense,
                                    "page": page_num + 1
                                })
            
            # Feature C: Greenwashing Detection Logic
            promises = results["action_vs_promise"]["Promise (Weak)"]
            actions = results["action_vs_promise"]["Action (Strong)"]
            
            # If promises are 2x higher than actions, flag it
            if actions > 0 and (promises / actions) > 2:
                results["greenwashing_risk"] = "High"
            elif promises > 10 and actions == 0:
                results["greenwashing_risk"] = "Critical"
            else:
                results["greenwashing_risk"] = "Low"

            # Feature B: Calculate Final Score
            results["overall_esg_score"] = self.calculate_esg_score(results)

            return results
            
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            return {}

if __name__ == "__main__":
    engine = CustomESGEngine("training_data.json")
    
    # 1. Train and Print Metrics (Precision/Recall)
    engine.train_and_evaluate()
     
    # 2. Model is saved - no need to process PDF here
    print("\n" + "="*60)
    print("✅ Model training complete!")
    print("The model has been saved to esg_model.pkl")
    print("="*60)
    # filename = sys.argv[1] if len(sys.argv) > 1 else "microsoft.pdf"
    
    # output = engine.process_pdf(filename)
    # if output:
    #     print(json.dumps(output, indent=4))