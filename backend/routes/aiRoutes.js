const express = require('express');
const { getTutorRecommendations, getBidSuggestion } = require('../controllers/aiController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/recommend', verifyToken, getTutorRecommendations);
router.post('/suggest-bid', verifyToken, getBidSuggestion);

module.exports = router;
