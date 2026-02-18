const express = require('express');
const { placeBid, getBidsForRequirement, getMyBids, updateBidStatus } = require('../controllers/bidController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, placeBid);
router.get('/requirement/:requirementId', verifyToken, getBidsForRequirement);
router.get('/my', verifyToken, getMyBids);
router.put('/:bidId/status', verifyToken, updateBidStatus);

module.exports = router;
