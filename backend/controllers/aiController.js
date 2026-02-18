const axios = require('axios');
require('dotenv').config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001';

const getTutorRecommendations = async (req, res) => {
    try {
        // In a real scenario, fetch tutors from DB first, then send to AI
        // For now, we'll just pass what the frontend might send or mock it
        // Or better: Fetch all tutors here, verify logic

        // This is a complex flow. 
        // 1. Fetch Tutors from DB (Postgres)
        // 2. Fetch Student Requirement from DB or Request
        // 3. Send to Python Service

        const { subject, budget, location } = req.body;

        // Mock fetching tutors from DB (skipping DB call for brevity in prototype, but controller structure is here)
        const mockTutors = [
            { id: 1, name: "Tutor A", subjects: ["Math", "Physics"], rating: 4.8 },
            { id: 2, name: "Tutor B", subjects: ["English"], rating: 4.2 }
        ];

        const response = await axios.post(`${AI_SERVICE_URL}/recommend-tutors`, {
            tutors: mockTutors,
            subject,
            budget,
            location
        });

        res.json(response.data);

    } catch (error) {
        console.error('Error contacting AI service:', error.message);
        // Fallback or error
        res.status(503).json({ error: 'AI Service unavailable' });
    }
};

const getBidSuggestion = async (req, res) => {
    try {
        const { budget_min, budget_max, subject } = req.body;
        const response = await axios.post(`${AI_SERVICE_URL}/suggest-bid`, {
            budget_min,
            budget_max,
            subject
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error contacting AI service:', error.message);
        res.status(503).json({ error: 'AI Service unavailable' });
    }
}

module.exports = { getTutorRecommendations, getBidSuggestion };
