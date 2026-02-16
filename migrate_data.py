import json
import random

def migrate():
    input_file = r"d:\python\ESG\DotChallengeROUND1A\training\training_data.json"
    output_file = input_file # Overwrite

    try:
        with open(input_file, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"File not found: {input_file}")
        return

    # 1. Update existing data with 'strength'
    counts = {"Environmental": 0, "Social": 0, "Governance": 0, "Irrelevant": 0}
    
    for item in data:
        label = item.get("label")
        if label in ["Environmental", "Social"]:
            item["strength"] = "High" # Assume existing are positive
        elif label == "Governance":
            # Check if it looks negative (none of the existing really do, but handle if so)
            # For now assume existing are High
            item["strength"] = "High"
        else:
            item["strength"] = "None"
        
        if label in counts:
            counts[label] += 1

    print("Current counts:", counts)

    # 2. Add new Negative/Neutral Governance samples
    # User requested at least 30-40% non-positive.
    # Current Gov is ~32. So we need ~10-14 negative/neutral.
    
    new_samples = [
        # User provided
        {"text": "The board failed to meet independence requirements.", "label": "Governance", "strength": "Low"},
        {"text": "Regulatory penalties were imposed due to compliance failures.", "label": "Governance", "strength": "Low"},
        {"text": "Whistleblower complaints increased by 40% year-on-year.", "label": "Governance", "strength": "Low"},
        {"text": "Audit findings revealed weaknesses in internal controls.", "label": "Governance", "strength": "Low"},
        {"text": "Board independence declined compared to last year.", "label": "Governance", "strength": "Low"},
        
        # Additional Synthesized
        {"text": "The company faced litigation regarding executive compensation.", "label": "Governance", "strength": "Low"},
        {"text": "There is a lack of diversity within the board of directors.", "label": "Governance", "strength": "Low"},
        {"text": "Shareholders voted against the proposed remuneration report.", "label": "Governance", "strength": "Low"},
        {"text": "Internal audits identified significant gaps in data privacy compliance.", "label": "Governance", "strength": "Low"},
        {"text": "The CEO also serves as the Chairman, reducing board independence.", "label": "Governance", "strength": "Low"}, # Often considered 'bad' governance or 'neutral' but trending 'low' strength for independence
        {"text": "Transparency regarding political lobbying remains limited.", "label": "Governance", "strength": "Low"},
        {"text": "The company does not disclose its full tax payments.", "label": "Governance", "strength": "Low"},
        {"text": "No independent review of the ESG report was conducted.", "label": "Governance", "strength": "Low"},
        
        # Neutral/Mixed (Medium strength?) User said "Low" for negative.
        # Let's stick to High/Low for simplicity as per user prompt.
    ]

    # Add them
    data.extend(new_samples)
    
    # Update counts
    counts["Governance"] += len(new_samples)
    print("New counts:", counts)
    
    # 3. Save
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Successfully migrated {len(data)} items to {output_file}")

if __name__ == "__main__":
    migrate()
