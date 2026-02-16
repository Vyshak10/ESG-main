# ESG Model Training and Usage Guide

## Current System Status

✅ **Your production system is already optimized!**

Your current setup (`python-service/esg_analyzer.py`) uses a **rule-based classifier** from `src/esg_core_ai.py` that:
- ✅ Does NOT retrain on every request
- ✅ Uses keyword matching (fast and efficient)
- ✅ Analyzes uploaded PDFs immediately
- ✅ Generates scores in real-time

## Files Explained

### Production Files (Currently Active)
- **`python-service/esg_analyzer.py`** - Main analyzer (uses rule-based, NO training)
- **`src/esg_core_ai.py`** - Rule-based classifier (keyword matching)
- **Status**: ✅ Already optimized, no retraining

### Training Files (For ML Model Development)
- **`training/custom_esg_trainer.py`** - OLD version (retrains every time ❌)
- **`training/train_once.py`** - NEW script to train ONCE and save model
- **`training/custom_esg_engine_optimized.py`** - Loads pre-trained model
- **Status**: Optional, only if you want to use ML instead of rules

## How to Use the ML Model (Optional)

If you want to switch from rule-based to ML-based classification:

### Step 1: Train the Model ONCE
```bash
cd training
python train_once.py
```
This creates `esg_model.pkl` (trained model file)

### Step 2: Use the Optimized Engine
```bash
python custom_esg_engine_optimized.py your_report.pdf
```

### Step 3: Integrate into Production (Optional)
Update `python-service/esg_analyzer.py` to use the ML model instead of rules.

## Recommendation

**Keep using your current system!** It's already optimized and doesn't retrain. The rule-based classifier is:
- Fast
- Reliable
- No training needed
- Works great for ESG analysis

Only switch to the ML model if you need more sophisticated classification or have labeled training data.

## Summary

- ✅ **Current system**: No retraining, already optimized
- ✅ **Training files**: Only for development/testing
- ✅ **Your uploads**: Analyzed fresh, scores generated immediately
- ✅ **No performance issues**: System is efficient as-is
