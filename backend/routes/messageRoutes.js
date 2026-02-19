const express = require('express');
const { getMessages, getConversations, sendMessage } = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/conversations', verifyToken, getConversations);
router.post('/', verifyToken, sendMessage);
router.get('/:otherUserId', verifyToken, getMessages);

module.exports = router;
