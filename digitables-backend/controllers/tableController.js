const Table = require('../models/Table');

const getTableData = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await Table.findById(tableId);
        
        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }

        res.json(table);
    } catch (error) {
        console.error('Error fetching table:', error);
        res.status(500).json({ error: 'Failed to fetch table data' });
    }
};

module.exports = { getTableData };