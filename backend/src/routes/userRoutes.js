const express = require('express');
const { getUserContent, getUserStats } = require('..backend/controllers/userController');
const { authenticateToken } = require('..backend/middleware/auth');

const router = express.Router();

// All user routes require authentication
router.get('/content', authenticateToken, getUserContent);
router.get('/stats', authenticateToken, getUserStats);

module.exports = router;