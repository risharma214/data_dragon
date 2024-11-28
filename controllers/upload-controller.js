const Project = require('../models/Project');
const File = require('../models/File');

const handleFileUpload = async (req, res) => {
    try {
        const { projectName } = req.body;
        const userId = req.user.id; 

        const project = new Project({
            userId,
            name: projectName
        });
        await project.save();

        const file = new File({
            projectId: project._id,
            originalName: req.file.originalname,
            s3Key: req.file.key,
            fileType: 'pdf', // assuming PDF for now
            fileSize: req.file.size,
            processingStatus: 'pending'
        });
        await file.save();

        res.json({
            message: 'File uploaded successfully',
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
        res.status(500).json({ error: 'Upload failed' });
    }
};

module.exports = {
    handleFileUpload
};
