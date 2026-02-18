from flask import Flask, request, jsonify

app = Flask(__name__)

# Placeholder for AI Logic
# In a real app, this would load models (scikit-learn, pytorch, etc.)

@app.route('/recommend-tutors', methods=['POST'])
def recommend_tutors():
    data = request.json
    # Expected data: { "student_id": "...", "subject": "Math", "budget": 500, "location": "..." }
    
    # Mock Logic: Return random scores for now or just echo back with a score
    # logic: if subject matches, give higher score
    
    # We really need the list of tutors to rank. 
    # Option A: Backend sends list of tutors to AI.
    # Option B: AI fetches tutors from DB (needs DB connection).
    
    # Going with Option A for microservice decoupling (stateless)
    tutors = data.get('tutors', [])
    subject = data.get('subject', '')
    
    scored_tutors = []
    for tutor in tutors:
        score = 0.5
        # Mock scoring
        if subject.lower() in str(tutor.get('subjects', [])).lower():
            score += 0.3
        if tutor.get('rating', 0) > 4.5:
            score += 0.1
        
        tutor['match_score'] = min(score, 0.99)
        scored_tutors.append(tutor)
        
    # Sort by score
    scored_tutors.sort(key=lambda x: x['match_score'], reverse=True)
    
    return jsonify({"recommended_tutors": scored_tutors})

@app.route('/suggest-bid', methods=['POST'])
def suggest_bid():
    data = request.json
    # Expected: { "requirement_details": ... }
    
    budget_min = data.get('budget_min', 0)
    budget_max = data.get('budget_max', 0)
    
    # specialized logic...
    suggested = (budget_min + budget_max) / 2
    
    return jsonify({"suggested_bid": suggested, "confidence": "high"})

@app.route('/', methods=['GET'])
def health():
    return "AI Service Running"

if __name__ == '__main__':
    app.run(port=5001, debug=True)
