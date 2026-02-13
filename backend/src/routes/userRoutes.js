const express = require('express');
const { getUserContent, getUserStats } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.get('/content', authenticateToken, getUserContent);
router.get('/stats', authenticateToken, getUserStats);

module.exports = router;