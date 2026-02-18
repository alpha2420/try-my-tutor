const express = require('express');
const { syncUser, getMe } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// Public route (technically authenticated via body payload check, but verified usually on frontend first)
// Actually, it's safer to verify the token here too if we pass it in header
router.post('/sync', verifyToken, syncUser);

// Protected route
router.get('/me', verifyToken, getMe);

module.exports = router;
