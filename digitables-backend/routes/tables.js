const express = require('express');
const router = express.Router();
const { getTableData } = require('../controllers/tableController');

router.get('/:tableId', getTableData);

module.exports = router;  // Export the router, not an object