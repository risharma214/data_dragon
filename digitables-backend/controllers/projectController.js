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

// const getUserProjects = async (req, res) => {
//     try {
//         const { userId } = req.query;
//         console.log('Received userId:', userId);

//         if (!userId) {
//             return res.status(400).json({ error: 'User ID is required' });
//         }

//         console.log('Attempting to create ObjectId with:', userId);
//         const userObjectId = new ObjectId(userId);
//         console.log('Created userObjectId:', userObjectId);

//         // Log the query we're about to execute
//         console.log('Executing MongoDB query with userId:', userObjectId);

//         // Fetch projects with their associated files
//         const projects = await Project.aggregate([
//             { 
//                 $match: { 
//                     userId: userObjectId 
//                 } 
//             },
//             {
//                 $lookup: {
//                     from: 'files',
//                     localField: '_id',
//                     foreignField: 'projectId',
//                     as: 'files'
//                 }
//             },
//             {
//                 $project: {
//                     id: '$_id',
//                     name: 1,
//                     description: 1,
//                     tables: { $size: '$files' },
//                     lastEdited: '$updatedAt',
//                     createdAt: 1
//                 }
//             }
//         ]);

//         console.log('Query results:', projects);

//         // Return empty array if no projects found instead of 404
//         res.json(projects || []);
//     } catch (error) {
//         console.error('Detailed error in getUserProjects:', error);
//         res.status(500).json({ error: 'Failed to fetch projects' });
//     }
// };

const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;

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
                            // Lookup tables for each file
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
                                        // Sort tables by page number
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

        if (!project || project.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const projectData = project[0];
        
        // Transform files array to include table count and processing status
        projectData.files = projectData.files.map(file => ({
            id: file._id,
            name: file.originalName,
            s3Key: file.s3Key,
            fileType: file.fileType,
            processingStatus: file.processingStatus,
            tableCount: file.tables.length,
            tables: file.tables.map(table => ({
                id: table._id,
                pageNumber: table.pageNumber,
                boundingBox: table.boundingBox,
                structure: {
                    rowCount: table.structure?.rowCount,
                    columnCount: table.structure?.columnCount
                }
            }))
        }));

        res.json({
            id: projectData._id,
            name: projectData.name,
            createdAt: projectData.createdAt,
            updatedAt: projectData.updatedAt,
            files: projectData.files
        });

    } catch (error) {
        console.error('Error fetching project details:', error);
        res.status(500).json({ error: 'Failed to fetch project details' });
    }
};

module.exports = {
    getUserProjects,
    getProjectDetails
};