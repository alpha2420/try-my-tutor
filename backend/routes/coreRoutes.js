const express = require('express');
const { createSession, getMySessions } = require('../controllers/sessionController');
const { getMessages } = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// Sessions
router.post('/', verifyToken, createSession);
router.get('/', verifyToken, getMySessions);

// Messages
router.get('/messages/:otherUserId', verifyToken, getMessages);

module.exports = router;
