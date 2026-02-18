const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getProfile);
router.put('/', verifyToken, updateProfile);

module.exports = router;
