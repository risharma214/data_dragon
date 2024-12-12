const express = require('express');
const router = express.Router();
const { getFileUrl } = require('../controllers/fileController');

router.get('/:fileId/url', getFileUrl);

module.exports = router;