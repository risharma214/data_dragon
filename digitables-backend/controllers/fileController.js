const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const File = require('../models/File');  // Add this line

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const getFileUrl = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.s3Key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return res.json({ url: signedUrl });

  } catch (error) {
    console.error('Error getting file URL:', error, error.stack);
    return res.status(500).json({ error: 'Failed to get file URL' });
  }
};

module.exports = { getFileUrl };