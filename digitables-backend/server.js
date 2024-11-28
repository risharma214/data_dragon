require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

// Initialize express app
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure multer for S3 upload
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Create organized folder structure
            const datePrefix = new Date().toISOString().split('T')[0];
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `uploads/${datePrefix}/${uniqueSuffix}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Accept only PDFs
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', message: 'DigiTables API Server is running' });
});

// File upload route
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded successfully:', {
            originalName: req.file.originalname,
            s3Key: req.file.key,
            location: req.file.location,
            size: req.file.size
        });

        res.json({
            message: 'File uploaded successfully',
            file: {
                name: req.file.originalname,
                key: req.file.key,
                url: req.file.location,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Error handling middleware
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