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
    details: mongoose.Schema.Types.Mixed
});

const boundingBoxSchema = new mongoose.Schema({
    Height: Number,
    Left: Number,
    Top: Number,
    Width: Number
}, { _id: false });

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
        type: boundingBoxSchema,
        required: true
    },
    originalData: {
        type: [[String]],
        required: true
    },
    currentData: {
        type: [[String]],
        required: true
    },
    structure: {
        rowCount: {
            type: Number,
            required: true
        },
        columnCount: {
            type: Number,
            required: true
        },
        mergedCells: [mergedCellSchema],
        highlights: [highlightSchema]
    },
    modifications: [modificationSchema],
    textractMetadata: {
        cellCoordinates: [[boundingBoxSchema]],
        processed: Boolean
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);