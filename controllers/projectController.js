const Project = require('../models/Project');
const File = require('../models/File');

const getUserProjects = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch projects with their associated files
        const projects = await Project.aggregate([
            { $match: { userId: userId } },
            {
                $lookup: {
                    from: 'files',
                    localField: '_id',
                    foreignField: 'projectId',
                    as: 'files'
                }
            },
            {
                $project: {
                    id: '$_id',
                    name: 1,
                    description: 1,
                    tables: { $size: '$files' },
                    lastEdited: '$updatedAt',
                    createdAt: 1
                }
            }
        ]);

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

module.exports = {
    getUserProjects
};