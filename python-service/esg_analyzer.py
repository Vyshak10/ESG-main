"""
Smart ESG Analyzer - Two-Stage Transformer Pipeline
Stage 1: Classification (Environmental, Social, Governance, None) using 'yiyanghkust/finbert-esg'
Stage 2: Sentiment Analysis (Positive, Negative, Neutral) using 'yiyanghkust/finbert-tone'
"""

import logging
import torch
import numpy as np
import fitz  # PyMuPDF
import re
from transformers import BertTokenizer, BertForSequenceClassification, pipeline
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ESGAnalyzer:
    def __init__(self):
        """
        Initialize the ESG Analyzer with Two-Stage Transformer Models.
        """
        self.device = self._check_device()
        logger.info(f"🚀 Initializing ESG Analyzer on {self.device}...")

        try:
            # --- Model 1: The Categorizer ---
            logger.info("Loading Model 1: yiyanghkust/finbert-esg (Categorizer)...")
            self.tokenizer_esg = BertTokenizer.from_pretrained('yiyanghkust/finbert-esg')
            self.model_esg = BertForSequenceClassification.from_pretrained('yiyanghkust/finbert-esg')
            
            # --- Model 2: The Sentiment Analyzer ---
            logger.info("Loading Model 2: yiyanghkust/finbert-tone (Sentiment)...")
            self.tokenizer_tone = BertTokenizer.from_pretrained('yiyanghkust/finbert-tone')
            self.model_tone = BertForSequenceClassification.from_pretrained('yiyanghkust/finbert-tone')

            # --- Optimization: Dynamic Quantization (CPU Only) ---
            if self.device.type == 'cpu':
                logger.info("⚡ Applying Dynamic Quantization for CPU optimization...")
                self.model_esg = torch.quantization.quantize_dynamic(
                    self.model_esg, {torch.nn.Linear}, dtype=torch.qint8
                )
                self.model_tone = torch.quantization.quantize_dynamic(
                    self.model_tone, {torch.nn.Linear}, dtype=torch.qint8
                )

            # Move models to device (Quantized models must stay on CPU)
            if self.device.type != 'cpu':
                self.model_esg.to(self.device)
                self.model_tone.to(self.device)

            self.model_esg.eval()
            self.model_tone.eval()
            
            # Categorizer pipeline
            self.nlp_esg = pipeline("text-classification", model=self.model_esg, tokenizer=self.tokenizer_esg, device=self.device)
            # Sentiment pipeline
            self.nlp_tone = pipeline("text-classification", model=self.model_tone, tokenizer=self.tokenizer_tone, device=self.device)
            
            logger.info("✅ Models loaded successfully.")

        except Exception as e:
            logger.error(f"❌ Failed to load models: {e}")
            raise e

    def _check_device(self):
        """
        Automatically detect available device (CUDA, MPS, or CPU).
        """
        if torch.cuda.is_available():
            return torch.device("cuda")
        elif torch.backends.mps.is_available():
            return torch.device("mps")
        else:
            return torch.device("cpu")

    def _sliding_window_chunker(self, text: str, chunk_size: int = 350, overlap: int = 50) -> List[str]:
        """
        Splits text into chunks of approx 'chunk_size' words using a sliding window.
        Preserves sentence boundaries.
        
        Args:
            text: Input text.
            chunk_size: Target word count per chunk.
            overlap: Number of words to overlap between chunks (context preservation).
        """
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = []
        current_len = 0
        
        for sentence in sentences:
            words = sentence.split()
            word_count = len(words)
            
            if current_len + word_count > chunk_size and current_chunk:
                # Store current chunk
                chunks.append(" ".join(current_chunk))
                
                # Start new chunk with overlap (last 'overlap' words or last sentence)
                # Simple approach: Keep the last sentence if it fits, otherwise clean start
                # Detailed approach: maintain a buffer. For simplicity here:
                # We will just reset nicely. Ideally, strict overlap requires token-level handling.
                # Here we will carry over the current sentence if it caused the overflow but wasn't added
                # But since we are iterating, we just reset.
                
                # REVISED STRATEGY for valid Sliding Window:
                # We need to backtrack. But simplified sentence grouping is usually robust enough for ESG.
                # Let's try to keep the last sentence as context if possible.
                last_sent = current_chunk[-1] if current_chunk else ""
                current_chunk = [last_sent] if len(last_sent.split()) < chunk_size else [] 
                current_len = len(current_chunk[0].split()) if current_chunk else 0
            
            current_chunk.append(sentence)
            current_len += word_count
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
            
        return chunks

    def analyze_document(self, pdf_path: str, company_name: str = "Unknown") -> Dict[str, Any]:
        """
        Main pipeline: Extract -> Chunk -> Categorize -> Sentiment -> Aggregate.
        Includes Hybrid Keyword Rescue for Governance.
        """
        logger.info(f"📄 Analyzing: {company_name}")
        
        # Define Keywords to rescue 'Governance' if AI misses it
        GOV_KEYWORDS = [
            "board of directors", "executive compensation", "whistleblower", 
            "code of conduct", "anti-corruption", "bribery", "audit committee", 
            "risk management", "shareholder rights", "compliance", "ethics policy",
            "remuneration", "independent director", "gdpr", "data privacy"
        ]

        # 1. Extract Text
        try:
            doc = fitz.open(pdf_path)
            full_text = ""
            for page in doc:
                full_text += page.get_text()
        except Exception as e:
            return {"error": f"Failed to read PDF: {e}"}

        # 2. Chunking
        chunks = self._sliding_window_chunker(full_text)
        logger.info(f"Generated {len(chunks)} chunks.")

        # 3. Processing
        results = {
            "Environmental": {"positive": 0, "negative": 0, "neutral": 0, "scores": [], "evidence": []},
            "Social": {"positive": 0, "negative": 0, "neutral": 0, "scores": [], "evidence": []},
            "Governance": {"positive": 0, "negative": 0, "neutral": 0, "scores": [], "evidence": []}
        }

        for chunk in chunks:
            # Skip empty or short chunks
            if len(chunk) < 50:
                continue

            # --- Stage 1: Categorization ---
            cat_output = self.nlp_esg(chunk, truncation=True, max_length=512, top_k=1)
            category = cat_output[0]['label'] 
            cat_score = cat_output[0]['score']

            # --- THE FIX: KEYWORD RESCUE LOGIC ---
            # If AI says "None" OR confidence is low, check for Governance keywords
            if category == "None" or cat_score < 0.6:
                chunk_lower = chunk.lower()
                # Check if any governance keyword exists in the chunk
                if any(kw in chunk_lower for kw in GOV_KEYWORDS):
                    category = "Governance"
                    cat_score = 0.85  # Assign a manual high confidence
                    logger.info("🔧 Rescued a Governance chunk using keywords!")
                else:
                    # If no keywords found, THEN skip
                    continue
            
            # --- Stage 2: Sentiment Analysis ---
            sent_output = self.nlp_tone(chunk, truncation=True, max_length=512, top_k=1)
            sentiment = sent_output[0]['label']
            
            # Store data
            if category in results:
                results[category][sentiment.lower()] += 1
                
                # Numeric representation
                numeric_score = 50
                if sentiment == "Positive": numeric_score = 100
                elif sentiment == "Negative": numeric_score = 0
                
                results[category]["scores"].append(numeric_score)
                
                # Keep top evidence
                if len(results[category]["evidence"]) < 3: 
                     results[category]["evidence"].append(chunk[:300] + "...")

        # 4. Aggregation (Same as before)
        final_output = {
            "overall_score": 0,
            "environmental": {},
            "social": {},
            "governance": {}
        }
        
        all_scores = []
        
        for cat in ["Environmental", "Social", "Governance"]:
            data = results[cat]
            count = len(data["scores"])
            
            if count > 0:
                avg_score = sum(data["scores"]) / count
                # Determine dominant sentiment
                dom_sentiment = "Neutral"
                if data["positive"] > data["negative"] and data["positive"] > data["neutral"]:
                    dom_sentiment = "Positive"
                elif data["negative"] > data["positive"]:
                    dom_sentiment = "Negative"
                
                final_output[cat.lower()] = {
                    "score": round(avg_score / 100, 2),
                    "sentiment": dom_sentiment,
                    "key_evidence": data["evidence"]
                }
                all_scores.extend(data["scores"])
            else:
                 final_output[cat.lower()] = {
                    "score": 0.0,
                    "sentiment": "None",
                    "key_evidence": []
                }

        # Overall Score
        if all_scores:
            final_output["overall_score"] = round((sum(all_scores) / len(all_scores)) / 100, 2)
        else:
            final_output["overall_score"] = 0.0

        return final_output
