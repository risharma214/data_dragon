const express = require('express');
const router = express.Router();
const { handleUserAuth } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', handleUserAuth);

// You might need these later
// router.post('/logout', handleLogout);
// router.get('/verify', verifyToken);

module.exports = router;
