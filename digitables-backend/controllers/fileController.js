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
  let file;
  try {
    const { fileId } = req.params;
    file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    console.log('Starting Textract processing for file:', file._id);
    
    file.processingStatus = 'processing';
    await file.save();

    const extractionResults = await processDocument(
      process.env.S3_BUCKET_NAME,
      file.s3Key
    );

    if (!extractionResults.results || !Array.isArray(extractionResults.results)) {
      throw new Error('Invalid extraction results format');
    }

    console.log(`Processing ${extractionResults.results.length} tables...`);

    const tables = await Promise.all(
      extractionResults.results.map(async (tableData) => {

        const tableDoc = {
          fileId: file._id,
          pageNumber: tableData.pageNumber,
          caption: tableData.caption,
          boundingBox: tableData.boundingBox,
          structure: {
            rowCount: tableData.structure.rowCount,
            columnCount: tableData.structure.columnCount,
            headerRowCount: tableData.structure.headerRowCount || 1,
            mergedCells: [],
            highlights: []
          },
          originalData: tableData.originalData,
          currentData: tableData.originalData,
          textractMetadata: {
            table: {
              confidence: tableData.textractMetadata.table.confidence,
              blockId: tableData.textractMetadata.table.blockId,
              relationships: tableData.textractMetadata.table.relationships.map(rel => ({
                Type: rel.Type,
                Ids: rel.Ids
              }))
            },
            cells: tableData.textractMetadata.cells.map(row => 
              row.map(cell => ({
                confidence: cell.confidence,
                boundingBox: cell.boundingBox,
                content: cell.content,
                rowIndex: cell.rowIndex,
                columnIndex: cell.columnIndex,
                isHeader: cell.isHeader || false,
                relationships: cell.relationships.map(rel => ({
                  Type: rel.Type,
                  Ids: rel.Ids
                }))
              }))
            )
          },
          processingStatus: 'completed',
          processingConfidence: tableData.processingConfidence
        };

        console.log('Saving table to MongoDB:', {
          dimensions: `${tableDoc.structure.rowCount}x${tableDoc.structure.columnCount}`,
          sampleData: tableDoc.originalData[0],
          currentData: tableDoc.currentData[0]
        });

        console.log(`Creating table for page ${tableData.pageNumber} with dimensions ${tableData.structure.rowCount}x${tableData.structure.columnCount}`);
        
        try {
          return await Table.create(tableDoc);
        } catch (error) {
          console.error('Error creating table:', error);
          throw error;
        }
      })
    );

    file.processingStatus = 'completed';
    file.tableCount = tables.length; // Add this field to File schema if not exists
    await file.save();

    const tablesByPage = tables.reduce((acc, table) => {
      if (!acc[table.pageNumber]) {
        acc[table.pageNumber] = [];
      }
      acc[table.pageNumber].push({
        id: table._id,
        rowCount: table.structure.rowCount,
        columnCount: table.structure.columnCount,
        caption: table.caption?.text
      });
      return acc;
    }, {});

    res.json({
      status: 'success',
      tableCount: tables.length,
      tablesByPage,
      file: {
        id: file._id,
        name: file.originalName,
        processingStatus: file.processingStatus
      }
    });

  } catch (error) {
    console.error('Error processing file:', error);
    
    if (file) {
      file.processingStatus = 'failed';
      await file.save();
    }

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
  processFile  
};