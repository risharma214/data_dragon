const Project = require('../models/Project');
const File = require('../models/File');
const { Types } = require('mongoose');

const handleFileUpload = async (req, res) => {
    try {
        const { projectName, userId } = req.body;
        
        if (!userId || !projectName) {
            return res.status(400).json({ 
                error: 'Both userId and projectName are required' 
            });
        }

        // Convert userId to ObjectId
        const userObjectId = new Types.ObjectId(userId);

        // Create new project
        const project = new Project({
            userId: userObjectId,
            name: projectName
        });
        await project.save();

        // Create file record
        const file = new File({
            projectId: project._id,
            originalName: req.file.originalname,
            s3Key: req.file.key,
            fileType: 'pdf',
            fileSize: req.file.size,
            processingStatus: 'pending'
        });
        await file.save();

        res.json({
            message: 'Upload successful',
            project: {
                id: project._id,
                name: project.name
            },
            file: {
                id: file._id,
                name: file.originalName,
                s3Key: file.s3Key
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: error.message || 'Upload failed' 
        });
    }
};

module.exports = {
    handleFileUpload
};