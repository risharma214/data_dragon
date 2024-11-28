const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    originalName: {
        type: String,
        required: true
    },
    s3Key: {
        type: String,
        required: true,
        unique: true
    },
    fileType: {
        type: String,
        required: true,
        enum: ['pdf', 'image', 'csv']
    },
    fileSize: {
        type: Number,
        required: true
    },
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    pageCount: {
        type: Number,
        default: 1  // Default 1 for images and CSVs
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('File', fileSchema);
