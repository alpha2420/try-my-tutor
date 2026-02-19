const express = require('express');
const { getProfile, updateProfile, getTutors } = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/tutors', verifyToken, getTutors);

module.exports = router;
