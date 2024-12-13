require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const connectDB = require('./db');

// Import all routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const fileRoutes = require('./routes/files');
const projectRoutes = require('./routes/projects');  // Add this line
const tableRoutes = require('./routes/tables');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Add logging middleware BEFORE routes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


// S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `uploads/${uniqueSuffix}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 
    }
});

app.locals.upload = upload;




// app.use('/api/projects', (req, res, next) => {
//     console.log('Projects route hit:', {
//         method: req.method,
//         url: req.url,
//         query: req.query,
//         params: req.params
//     });
//     next();
// });

app.use('/api/projects', (req, res, next) => {
    console.log('Projects route hit:', {
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params
    });
    next();
}, projectRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/files', fileRoutes);
// app.use('/api/projects', projectRoutes);  // Add the projects route normally
app.use('/api/tables', tableRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', message: 'DigiTables API Server is running' });
});

// Single error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: error.message || 'Internal server error',
        code: error.code
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`S3 bucket: ${process.env.S3_BUCKET_NAME}`);
    console.log(`Region: ${process.env.AWS_REGION}`);
});