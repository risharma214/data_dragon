const express = require('express');
const router = express.Router();
const { 
    getUserProjects, 
    getProjectDetails,
    renameProject,
    deleteProject
} = require('../controllers/projectController');

// Existing route for getting user's projects
router.get('/', getUserProjects);

// New route for getting single project details
router.get('/:projectId', getProjectDetails);

router.patch('/:projectId/rename', renameProject);
router.delete('/:projectId', deleteProject);

module.exports = router;