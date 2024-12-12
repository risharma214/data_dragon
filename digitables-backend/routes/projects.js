const express = require('express');
const router = express.Router();
const { getUserProjects, getProjectDetails } = require('../controllers/projectController');

// Existing route for getting user's projects
router.get('/', getUserProjects);

// New route for getting single project details
router.get('/:projectId', getProjectDetails);

module.exports = router;