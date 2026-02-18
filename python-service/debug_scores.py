"""
Debug script to analyze why Governance scores are 0
This will show you what categories the model is detecting
"""

import fitz  # PyMuPDF
import re
from transformers import BertTokenizer, BertForSequenceClassification, pipeline
import torch

# Initialize models
print("Loading models...")
tokenizer_esg = BertTokenizer.from_pretrained('yiyanghkust/finbert-esg')
model_esg = BertForSequenceClassification.from_pretrained('yiyanghkust/finbert-esg')
nlp_esg = pipeline("text-classification", model=model_esg, tokenizer=tokenizer_esg, device=-1)

tokenizer_tone = BertTokenizer.from_pretrained('yiyanghkust/finbert-tone')
model_tone = BertForSequenceClassification.from_pretrained('yiyanghkust/finbert-tone')
nlp_tone = pipeline("text-classification", model=model_tone, tokenizer=tokenizer_tone, device=-1)

print("Models loaded!\n")

def analyze_pdf_debug(pdf_path):
    """Analyze PDF and show detailed breakdown"""
    
    # Extract text
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    
    # Simple chunking
    sentences = re.split(r'(?<=[.!?])\s+', full_text)
    chunks = []
    current_chunk = []
    current_len = 0
    
    for sentence in sentences:
        words = sentence.split()
        word_count = len(words)
        
        if current_len + word_count > 350 and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_len = 0
        
        current_chunk.append(sentence)
        current_len += word_count
    
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    print(f"📄 Total chunks: {len(chunks)}\n")
    
    # Track categories
    category_counts = {
        'Environmental': 0,
        'Social': 0,
        'Governance': 0,
        'None': 0,
        'Low Confidence': 0
    }
    
    governance_chunks = []
    
    # Analyze each chunk
    for i, chunk in enumerate(chunks):
        if len(chunk) < 50:
            continue
        
        # Classify
        cat_output = nlp_esg(chunk, truncation=True, max_length=512, top_k=None)
        
        # Get top prediction
        top_pred = cat_output[0]
        category = top_pred['label']
        confidence = top_pred['score']
        
        # Count categories
        if confidence < 0.6:
            category_counts['Low Confidence'] += 1
        else:
            category_counts[category] += 1
            
            # If it's Governance, save it
            if category == 'Governance':
                sent_output = nlp_tone(chunk, truncation=True, max_length=512, top_k=1)
                sentiment = sent_output[0]['label']
                sent_conf = sent_output[0]['score']
                
                governance_chunks.append({
                    'chunk_num': i,
                    'text': chunk[:200] + "...",
                    'confidence': confidence,
                    'sentiment': sentiment,
                    'sent_confidence': sent_conf
                })
    
    # Print summary
    print("=" * 60)
    print("CATEGORY BREAKDOWN:")
    print("=" * 60)
    for cat, count in category_counts.items():
        percentage = (count / len(chunks)) * 100 if len(chunks) > 0 else 0
        print(f"{cat:20s}: {count:4d} chunks ({percentage:5.1f}%)")
    
    print("\n" + "=" * 60)
    print(f"GOVERNANCE CHUNKS FOUND: {len(governance_chunks)}")
    print("=" * 60)
    
    if len(governance_chunks) == 0:
        print("\n⚠️  NO GOVERNANCE CHUNKS DETECTED!")
        print("\nPossible reasons:")
        print("1. The PDF doesn't contain governance-related content")
        print("2. The model isn't recognizing the governance language")
        print("3. Confidence threshold (60%) is filtering them out")
        print("\nTry analyzing a different PDF or lowering the confidence threshold.")
    else:
        print(f"\n✅ Found {len(governance_chunks)} governance chunks:\n")
        for chunk_info in governance_chunks[:5]:  # Show first 5
            print(f"Chunk #{chunk_info['chunk_num']}:")
            print(f"  Confidence: {chunk_info['confidence']:.2%}")
            print(f"  Sentiment: {chunk_info['sentiment']} ({chunk_info['sent_confidence']:.2%})")
            print(f"  Text: {chunk_info['text']}")
            print()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python debug_scores.py <path_to_pdf>")
        print("\nExample:")
        print("  python debug_scores.py ../uploads/company_report.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    print(f"Analyzing: {pdf_path}\n")
    analyze_pdf_debug(pdf_path)
