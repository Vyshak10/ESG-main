import json
from custom_esg_trainer import CustomESGEngine  # Import your existing engine

def compare_reports(file_2023, file_2024):
    print(f"--- Comparing {file_2023} vs {file_2024} ---")
    
    # 1. Initialize and Train Logic
    engine = CustomESGEngine("training_data.json")
    engine.train_and_evaluate() # Ensures model is ready
    
    # 2. Process Both Files
    data_2023 = engine.process_pdf(file_2023)
    data_2024 = engine.process_pdf(file_2024)
    
    if not data_2023 or not data_2024:
        print("Error: Could not process one of the files.")
        return

    # 3. Calculate Comparison Logic
    categories = ["Environmental", "Social", "Governance"]
    comparison = {}
    
    print("\n--- Year-over-Year Analysis ---")
    for cat in categories:
        count_23 = data_2023.get(cat, 0)
        count_24 = data_2024.get(cat, 0)
        
        # Avoid division by zero
        if count_23 == 0:
            pct_change = 100 if count_24 > 0 else 0
        else:
            pct_change = ((count_24 - count_23) / count_23) * 100
            
        comparison[cat] = {
            "2023_count": count_23,
            "2024_count": count_24,
            "change_pct": round(pct_change, 1)
        }
        
        # Print for simple presentation
        arrow = "↑" if pct_change > 0 else "↓"
        print(f"{cat}: {count_23} -> {count_24} ({arrow} {pct_change:.1f}%)")

    # 4. Compare "Action" vs "Promise" (The advanced insight)
    action_23 = data_2023["action_vs_promise"]["Action (Strong)"]
    action_24 = data_2024["action_vs_promise"]["Action (Strong)"]
    
    print(f"\nTangible Action Statements: {action_23} -> {action_24}")
    if action_24 > action_23:
        print("Insight: The company has moved from 'Planning' to 'Executing'.")
    else:
        print("Insight: The company is making fewer concrete claims this year.")

    return comparison

# Execution
if __name__ == "__main__":
    # You can test this by copying your microsoft.pdf to "microsoft_2023.pdf" 
    # and "microsoft_2024.pdf" just to see it run.
    compare_reports("microsoft_2023.pdf", "microsoft_2024.pdf")