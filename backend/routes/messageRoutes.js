const express = require('express');
const { getMessages, getConversations } = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/conversations', verifyToken, getConversations);
router.get('/:otherUserId', verifyToken, getMessages);

module.exports = router;
