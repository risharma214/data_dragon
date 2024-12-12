const express = require('express');
const router = express.Router();
const { handleFileUpload } = require('../controllers/uploadController');

// POST /api/upload
router.post('/', (req, res, next) => {
    // upload middleware from app.locals
    const upload = req.app.locals.upload;
    
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, handleFileUpload);

module.exports = router;