const express = require('express');
const { createRequirement, getRequirements, getMyRequirements } = require('../controllers/requirementController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, createRequirement);
router.get('/', getRequirements); // Public or protected? Maybe public to browse? Let's keep it open for now or add verifyToken if needed.
router.get('/my', verifyToken, getMyRequirements);

module.exports = router;
