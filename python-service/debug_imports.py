import sys
import os

print(f"Python executable: {sys.executable}")
try:
    import torch
    print(f"Torch version: {torch.__version__}")
except ImportError as e:
    print(f"Failed to import torch: {e}")

try:
    import transformers
    print(f"Transformers version: {transformers.__version__}")
except ImportError as e:
    print(f"Failed to import transformers: {e}")

try:
    from esg_analyzer import ESGAnalyzer
    print("Successfully imported ESGAnalyzer class")
except Exception as e:
    print(f"Failed to import ESGAnalyzer: {e}")
