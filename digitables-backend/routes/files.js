const express = require('express');
const router = express.Router();
const { getFileUrl, processFile } = require('../controllers/fileController');

console.log('File routes loaded'); 


// Add debug log
router.post('/:fileId/process', (req, res, next) => {
    console.log('Process route hit:', req.params);
    next();
}, processFile);

router.get('/:fileId/url', getFileUrl);

module.exports = router;