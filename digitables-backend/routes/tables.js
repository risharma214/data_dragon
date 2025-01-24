const express = require('express');
const router = express.Router();
const { getTableData, updateTable } = require('../controllers/tableController');

router.get('/:tableId', getTableData);

router.patch('/:tableId', updateTable);

module.exports = router;  