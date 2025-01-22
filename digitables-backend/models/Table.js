const mongoose = require('mongoose');

// Keep existing sub-schemas
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

// Enhanced boundingBox schema to include polygon points
const boundingBoxSchema = new mongoose.Schema({
    Height: Number,
    Left: Number,
    Top: Number,
    Width: Number,
    polygon: [{
        X: Number,
        Y: Number
    }]
}, { _id: false });

// New schema for table metadata from Textract

const relationshipSchema = new mongoose.Schema({
    Type: { type: String, default: '' },
    Ids: { type: [String], default: [] }
}, { _id: false });
  
const cellMetadataSchema = new mongoose.Schema({
    confidence: { type: Number, default: 0 },
    boundingBox: { type: boundingBoxSchema, default: () => ({}) },
    content: { type: String, default: '' },
    rowIndex: { type: Number, default: 0 },
    columnIndex: { type: Number, default: 0 },
    isHeader: { type: Boolean, default: false },
    relationships: { type: [relationshipSchema], default: [] }
}, { _id: false });

const textractMetadataSchema = new mongoose.Schema({
    table: {
        confidence: Number,
        blockId: String,
        relationships: [relationshipSchema]  // And here
    },
    cells: [[cellMetadataSchema]]
    }, { _id: false }
);



// Enhanced table schema
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
    caption: {
        text: String,
        confidence: Number,
        boundingBox: boundingBoxSchema
    },
    boundingBox: {
        type: boundingBoxSchema,
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
        headerRowCount: {
            type: Number,
            default: 1
        },
        mergedCells: [mergedCellSchema],
        highlights: [highlightSchema]
    },
    originalData: {
        type: [[String]],
        required: true
    },
    currentData: {
        type: [[String]],
        required: true
    },
    modifications: [modificationSchema],

    textractMetadata: {
        table: {
            type: {
                confidence: Number,
                blockId: String,
                relationships: [relationshipSchema]
            },
            required: true
        },
        cells: {
            type: [[cellMetadataSchema]],
            required: true
        }
    },

    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    processingConfidence: {
        type: Number,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Add indexes for common queries
tableSchema.index({ fileId: 1, pageNumber: 1 });
tableSchema.index({ processingStatus: 1 });

module.exports = mongoose.model('Table', tableSchema);