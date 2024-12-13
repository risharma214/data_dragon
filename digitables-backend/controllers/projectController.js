const Project = require('../models/Project');
const File = require('../models/File');
const { ObjectId } = require('mongodb');

const getUserProjects = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log('getUserProjects called with userId:', userId);

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Direct MongoDB query without aggregation
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

        console.log('Raw project data:', JSON.stringify(project, null, 2));

        if (!project || project.length === 0) {
            console.log('No project found with ID:', projectId);
            return res.status(404).json({ error: 'Project not found' });
        }

        const projectData = project[0];
        console.log('Processing files for project:', projectData._id);
        
        // Transform files array to include table count and processing status
        projectData.files = projectData.files.map(file => {
            console.log('Processing file:', file._id, 'Tables:', file.tables?.length || 0);
            return {
                id: file._id,
                name: file.originalName,
                s3Key: file.s3Key,
                fileType: file.fileType,
                processingStatus: file.processingStatus,
                tableCount: file.tables?.length || 0,
                tables: (file.tables || []).map(table => {
                    console.log('Processing table:', table._id, 'Structure:', table.structure);
                    return {
                        id: table._id,
                        pageNumber: table.pageNumber,
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
    getProjectDetails
};