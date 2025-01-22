const Table = require('../models/Table');
const Project = require('../models/Project');
const File = require('../models/File');


const getTableData = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await Table.findById(tableId);
        
        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }

        console.log('Fetching from MongoDB:', {
            dimensions: `${table.structure.rowCount}x${table.structure.columnCount}`,
            sampleData: table.currentData[0],
            originalData: table.originalData[0]
        });

        console.log('Sending table data:', {
            hasCurrentData: !!table.currentData,
            currentDataSize: table.currentData ? `${table.currentData.length}x${table.currentData[0]?.length}` : 'none',
            structure: table.structure
        });

        res.json(table);
    } catch (error) {
        console.error('Error fetching table:', error);
        res.status(500).json({ error: 'Failed to fetch table data' });
    }
};

const updateTable = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { currentData, structure } = req.body;

        console.log('Updating table:', {
            tableId,
            currentData,
            structure
        });

        const table = await Table.findById(tableId);
        
        if (!table) {
            console.log('Table not found:', tableId);
            return res.status(404).json({ error: 'Table not found' });
        }

        // Update table data
        table.currentData = currentData;
        if (structure) {
            table.structure = {
                ...table.structure,
                ...structure
            };
        }

        const updatedTable = await table.save();
        console.log('Table updated successfully');

        // Find the file to get project ID
        const file = await File.findById(table.fileId);
        if (file) {
            // Update project's updatedAt timestamp
            await Project.findByIdAndUpdate(
                file.projectId,
                { $set: { updatedAt: new Date() } }
            );
        }

        res.json(updatedTable);
    } catch (error) {
        console.error('Error updating table:', error);
        res.status(500).json({ 
            error: 'Failed to update table',
            details: error.message 
        });
    }
};


module.exports = { getTableData, updateTable };