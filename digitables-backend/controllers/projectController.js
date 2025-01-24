const Project = require('../models/Project');
const File = require('../models/File');
const Table = require('../models/Table');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { ObjectId } = require('mongodb');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const getUserProjects = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log('getUserProjects called with userId:', userId);

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const projects = await Project.find({ 
            userId: new ObjectId(userId) 
        });
        
        console.log('Found projects:', projects);
        
        res.json(projects);
    } catch (error) {
        console.error('Error in getUserProjects:', error);
        res.status(500).json({ 
            error: 'Failed to fetch projects',
            details: error.message 
        });
    }
};

const renameProject = async (req, res) => {
    try {
        const { projectId } = req.params;  
        const { newName } = req.body;    

        console.log('Renaming project:', { projectId, newName });

        if (!newName || newName.trim().length === 0) {
            return res.status(400).json({ error: 'Project name cannot be empty' });
        }

        const project = await Project.findByIdAndUpdate(
            projectId,
            { name: newName.trim() },
            { new: true }  
        );

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error renaming project:', error);
        res.status(500).json({ 
            error: 'Failed to rename project',
            details: error.message 
        });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const files = await File.find({ projectId });

        // Delete files from S3 and collect all tableIds
        const deletionPromises = files.map(async (file) => {
            try {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: file.s3Key
                });
                await s3Client.send(deleteCommand);
            } catch (error) {
                console.error(`Failed to delete file ${file.s3Key} from S3:`, error);
                // continue with other deletions even if S3 deletion fails
            }

            // Find and delete all tables associated with this file
            await Table.deleteMany({ fileId: file._id });
        });

        // Wait for all S3 deletions and table deletions to complete
        await Promise.all(deletionPromises);

        // Delete all files from MongoDB
        await File.deleteMany({ projectId });

        // Finally, delete the project
        await Project.findByIdAndDelete(projectId);

        res.json({ message: 'Project and associated resources deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ 
            error: 'Failed to delete project',
            details: error.message 
        });
    }
};

const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;
        console.log('Fetching project details for:', projectId);

        // Validate projectId format
        if (!ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: 'Invalid project ID format' });
        }

        const projectObjectId = new ObjectId(projectId);

        // Fetch project with files using aggregation
        const project = await Project.aggregate([
            {
                $match: {
                    _id: projectObjectId
                }
            },
            {
                $lookup: {
                    from: 'files',
                    let: { projectId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$projectId', '$$projectId'] }
                            }
                        },
                        {
                            $lookup: {
                                from: 'tables',
                                let: { fileId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$fileId', '$$fileId'] }
                                        }
                                    },
                                    {
                                        $sort: { pageNumber: 1 }
                                    }
                                ],
                                as: 'tables'
                            }
                        }
                    ],
                    as: 'files'
                }
            }
        ]);

        // console.log('Raw project data:', JSON.stringify(project, null, 2));

        if (!project || project.length === 0) {
            console.log('No project found with ID:', projectId);
            return res.status(404).json({ error: 'Project not found' });
        }

        const projectData = project[0];
        console.log('Processing files for project:', projectData._id);
        
        projectData.files = projectData.files.map(file => {
            return {
                id: file._id,
                name: file.originalName,
                s3Key: file.s3Key,
                fileType: file.fileType,
                processingStatus: file.processingStatus,
                tableCount: file.tables?.length || 0,
                tables: (file.tables || []).map(table => {
                    return {
                        id: table._id,
                        pageNumber: table.pageNumber,
                        caption: table.caption,  // Add this
                        boundingBox: table.boundingBox,
                        structure: {
                            rowCount: table.structure?.rowCount,
                            columnCount: table.structure?.columnCount
                        }
                    };
                })
            };
        });

        const response = {
            id: projectData._id,
            name: projectData.name,
            createdAt: projectData.createdAt,
            updatedAt: projectData.updatedAt,
            files: projectData.files
        };

        console.log('Sending response:', JSON.stringify(response, null, 2));
        res.json(response);

    } catch (error) {
        console.error('Error in getProjectDetails:', error);
        res.status(500).json({ 
            error: 'Failed to fetch project details',
            details: error.message 
        });
    }
};

module.exports = {
    getUserProjects,
    getProjectDetails,
    renameProject,
    deleteProject
};