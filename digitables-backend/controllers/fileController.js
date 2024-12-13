const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const File = require('../models/File');
const Table = require('../models/Table');  // Add this import
const { processDocument } = require('../services/textract');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const processFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    console.log('Starting Textract processing for file:', file._id);
    const extractionResults = await processDocument(
      process.env.S3_BUCKET_NAME,
      file.s3Key
    );

    if (extractionResults.results && extractionResults.results.length > 0) {
      console.log(`Creating ${extractionResults.results.length} table records...`);
      const tables = await Promise.all(
        extractionResults.results.map(async (tableData) => {
          const tableDoc = {
            fileId: file._id,
            pageNumber: 1,  // We'll need to get this from Textract later
            boundingBox: tableData.boundingBox,
            structure: {
              rowCount: tableData.structure.rowCount,
              columnCount: tableData.structure.columnCount,
              mergedCells: [],  // Initialize empty
              highlights: []    // Initialize empty
            },
            originalData: tableData.originalData,
            currentData: tableData.originalData,
            textractMetadata: {
              cellCoordinates: tableData.cellMetadata,
              processed: true
            }
          };

          console.log('Creating table with structure:', JSON.stringify(tableDoc.structure, null, 2));
          return await Table.create(tableDoc);
        })
      );

      console.log('Successfully created tables:', tables.map(t => t._id));
    }

    file.processingStatus = 'completed';
    await file.save();

    res.json({
      status: 'success',
      tableCount: extractionResults.results?.length || 0
    });

  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      error: 'Failed to process file',
      details: error.message 
    });
  }
};


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

module.exports = { 
  getFileUrl,
  processFile  // Make sure both functions are exported
};