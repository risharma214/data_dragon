const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
    row: Number,
    col: Number,
    color: String
});

const mergedCellSchema = new mongoose.Schema({
    startRow: Number,
    startCol: Number,
    rowSpan: Number,
    colSpan: Number
});

const modificationSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['cellEdit', 'merge', 'highlight', 'addRow', 'addColumn', 'deleteRow', 'deleteColumn'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    details: mongoose.Schema.Types.Mixed  // Flexible field for different modification types
});

const tableSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'File'
    },
    pageNumber: {
        type: Number,
        required: true
    },
    boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
    },
    originalData: [[String]],  // 2D array of strings
    currentData: [[String]],   // 2D array of strings
    structure: {
        rowCount: Number,
        columnCount: Number,
        mergedCells: [mergedCellSchema],
        highlights: [highlightSchema]
    },
    modifications: [modificationSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
