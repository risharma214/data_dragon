const express = require('express');
const router = express.Router();
const { getUserProjects } = require('../controllers/projectController');

// GET /api/projects
router.get('/', getUserProjects);

module.exports = router;