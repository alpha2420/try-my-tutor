const express = require('express');
const { createSession, getMySessions } = require('../controllers/sessionController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, createSession);
router.get('/', verifyToken, getMySessions);

module.exports = router;
