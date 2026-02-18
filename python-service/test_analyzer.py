import fitz
import os
import json
from esg_analyzer import ESGAnalyzer

def create_dummy_pdf(filename="test_report.pdf"):
    doc = fitz.open()
    page = doc.new_page()
    text = """
    We are strongly committed to Environmental sustainability. 
    We aim to reduce our carbon footprint by 50% by 2030. 
    This is a critical goal for our planet.

    On the Social front, we have improved diversity in our workforce by 20%.
    We care deeply about our employees and community. 
    
    Our Governance structure is robust and transparent.
    We identify and mitigate risks proactively.
    The board is committed to ethical practices.
    """
    page.insert_text((50, 50), text)
    doc.save(filename)
    doc.close()
    return filename

def main():
    pdf_path = create_dummy_pdf()
    print(f"Created dummy PDF at {pdf_path}")

    try:
        print("Initializing ESG Analyzer...")
        analyzer = ESGAnalyzer()
        
        print("Running analysis...")
        result = analyzer.analyze_document(pdf_path, "Test Company")
        
        print("\nAnalysis Result:")
        print(json.dumps(result, indent=2))
        
        # Simple assertions
        assert "overall_score" in result
        assert "environmental" in result
        assert result["environmental"]["score"] >= 0
        print("\n✅ Verification Successful!")
        
    except Exception as e:
        print(f"\n❌ Verification Failed: {e}")
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

if __name__ == "__main__":
    main()
