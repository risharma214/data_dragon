// services/textract.js
const { 
    TextractClient, 
    AnalyzeDocumentCommand,
    GetDocumentAnalysisCommand,
    StartDocumentAnalysisCommand 
  } = require("@aws-sdk/client-textract");
  
  const textractClient = new TextractClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });
  
  const processDocument = async (bucketName, documentKey) => {
    try {
      // Start async document analysis
      const startCommand = new StartDocumentAnalysisCommand({
        DocumentLocation: {
          S3Object: {
            Bucket: bucketName,
            Name: documentKey
          }
        },
        FeatureTypes: ['TABLES'], // Specifically request table analysis
      });
  
      const startResponse = await textractClient.send(startCommand);
      const jobId = startResponse.JobId;
  
      // Function to check job status
      const checkJobStatus = async () => {
        const statusCommand = new GetDocumentAnalysisCommand({
          JobId: jobId
        });
  
        const statusResponse = await textractClient.send(statusCommand);
        return statusResponse.JobStatus;
      };
  
      // Poll until job is complete
      let jobStatus;
      do {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
        jobStatus = await checkJobStatus();
      } while (jobStatus === 'IN_PROGRESS');
  
      if (jobStatus === 'SUCCEEDED') {
        // Get the results
        const results = await getDocumentResults(jobId);
        return {
          status: 'success',
          jobId,
          results
        };
      } else {
        throw new Error(`Document analysis failed with status: ${jobStatus}`);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  };
  
  const getDocumentResults = async (jobId) => {
    try {
      const results = [];
      let nextToken = null;
  
      do {
        const getCommand = new GetDocumentAnalysisCommand({
          JobId: jobId,
          NextToken: nextToken
        });
  
        const response = await textractClient.send(getCommand);
        results.push(...response.Blocks);
        nextToken = response.NextToken;
      } while (nextToken);
  
      return processTextractResults(results);
    } catch (error) {
      console.error('Error getting document results:', error);
      throw error;
    }
  };
  
  // In services/textract.js, update the processTextractResults function:
// In services/textract.js, update the processTextractResults function

const processTextractResults = (blocks) => {
  console.log('Processing blocks:', JSON.stringify(blocks, null, 2));

  if (!Array.isArray(blocks)) {
    console.error('Blocks is not an array:', blocks);
    return [];
  }

  // Group blocks by table
  const tables = [];
  let currentTable = null;

  // First pass: find tables
  for (const block of blocks) {
    if (block.BlockType === 'TABLE') {
      currentTable = {
        boundingBox: block.Geometry?.BoundingBox || null,
        cells: [],
        relationships: block.Relationships || []
      };
      tables.push(currentTable);
    }
  }

  // Second pass: collect cells with their content
  for (const block of blocks) {
    if (block.BlockType === 'CELL' && currentTable) {
      // Get the cell's actual content
      let cellContent = '';
      if (block.Relationships) {
        // Find WORD blocks that are children of this cell
        const wordIds = block.Relationships
          .filter(rel => rel.Type === 'CHILD')
          .flatMap(rel => rel.Ids);
        
        // Get text from each word block
        const words = wordIds
          .map(id => blocks.find(b => b.Id === id))
          .filter(b => b && b.BlockType === 'WORD')
          .map(b => b.Text);
        
        cellContent = words.join(' ');
      }

      currentTable.cells.push({
        rowIndex: block.RowIndex - 1,
        columnIndex: block.ColumnIndex - 1,
        content: cellContent,
        boundingBox: block.Geometry?.BoundingBox || null,
        confidence: block.Confidence || 0
      });
    }
  }

  // Process tables
  return tables.map(table => {
    // Calculate dimensions
    const rowIndices = table.cells.map(cell => cell.rowIndex);
    const colIndices = table.cells.map(cell => cell.columnIndex);
    const rowCount = Math.max(...rowIndices) + 1;
    const columnCount = Math.max(...colIndices) + 1;

    // Create data arrays
    const tableData = Array(rowCount).fill(null)
      .map(() => Array(columnCount).fill(''));
    
    // Fill in cell content
    table.cells.forEach(cell => {
      if (cell.rowIndex >= 0 && cell.rowIndex < rowCount &&
          cell.columnIndex >= 0 && cell.columnIndex < columnCount) {
        tableData[cell.rowIndex][cell.columnIndex] = cell.content;
      }
    });

    return {
      boundingBox: table.boundingBox,
      structure: {
        rowCount,
        columnCount
      },
      originalData: tableData,
      cellMetadata: table.cells.map(cell => ({
        boundingBox: cell.boundingBox,
        confidence: cell.confidence
      }))
    };
  });
};

const createTableArray = (cells, rowCount, columnCount) => {
  // Initialize array with empty strings
  const arr = Array(rowCount).fill(null)
    .map(() => Array(columnCount).fill(''));

  // Fill in the values
  cells.forEach(cell => {
    if (cell.rowIndex >= 0 && cell.rowIndex < rowCount &&
        cell.columnIndex >= 0 && cell.columnIndex < columnCount) {
      arr[cell.rowIndex][cell.columnIndex] = cell.content;
    }
  });

  return arr;
};

const createCellMetadataArray = (cells, rowCount, columnCount) => {
  // Initialize array with nulls
  const arr = Array(rowCount).fill(null)
    .map(() => Array(columnCount).fill(null));

  // Fill in the metadata
  cells.forEach(cell => {
    if (cell.rowIndex >= 0 && cell.rowIndex < rowCount &&
        cell.columnIndex >= 0 && cell.columnIndex < columnCount) {
      arr[cell.rowIndex][cell.columnIndex] = {
        boundingBox: cell.boundingBox,
        confidence: cell.confidence
      };
    }
  });

  return arr;
  };
  
  module.exports = {
    processDocument
  };