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

    // Save the raw results to a file for analysis
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = `./textract-results-${timestamp}.json`;
    
    fs.writeFileSync(
      outputPath,
      JSON.stringify({
        timestamp,
        jobId,
        blocks: results
      }, null, 2)
    );

    console.log(`Raw Textract results saved to: ${outputPath}`);

    return processTextractResults(results);
  } catch (error) {
    console.error('Error getting document results:', error);
    throw error;
  }
};




const processTextractResults = (blocks) => {
  console.log(`Processing ${blocks.length} blocks`);

  // First pass: Create maps for different block types
  const tableBlocks = new Map();
  const cellBlocks = new Map();
  const lineBlocks = new Map();

  const blockTypeCounts = blocks.reduce((acc, block) => {
    acc[block.BlockType] = (acc[block.BlockType] || 0) + 1;
    return acc;
  }, {});

  console.log('Block type counts:', blockTypeCounts);

  blocks.forEach(block => {
    switch (block.BlockType) {
      case 'TABLE':
        tableBlocks.set(block.Id, {
          ...block,
          cells: [],
          caption: null
        });
        break;
      case 'CELL':
        cellBlocks.set(block.Id, block);
        break;
      case 'LINE':
        lineBlocks.set(block.Id, block);
        break;
    }
  });

  // Second pass: Associate cells with tables and find captions

  tableBlocks.forEach((table, tableId) => {

    // Find cells belonging to this table
    const tableCellIds = table.Relationships?.find(rel => rel.Type === 'CHILD')?.Ids || [];
    const cells = tableCellIds
      .map(id => cellBlocks.get(id))
      .filter(cell => cell); // Filter out any undefined cells

    // Sort cells by row and column
    cells.sort((a, b) => {
      if (a.RowIndex === b.RowIndex) {
        return a.ColumnIndex - b.ColumnIndex;
      }
      return a.RowIndex - b.RowIndex;
    });

    // Look for potential caption (lines just above the table)
    const tableTop = table.Geometry.BoundingBox.Top;
    const potentialCaptions = Array.from(lineBlocks.values())
      .filter(line => {
        const lineBottom = line.Geometry.BoundingBox.Top + line.Geometry.BoundingBox.Height;
        return line.Page === table.Page && 
               Math.abs(lineBottom - tableTop) < 0.02; // Within 2% of page height
      })
      .sort((a, b) => b.Geometry.BoundingBox.Top - a.Geometry.BoundingBox.Top);

    if (potentialCaptions.length > 0) {
      const caption = potentialCaptions[0];
      table.caption = {
        text: caption.Text,
        confidence: caption.Confidence,
        boundingBox: caption.Geometry.BoundingBox
      };
    }

    table.cells = cells;
  });

  // Process each table into our desired format
  return Array.from(tableBlocks.values()).map(table => {
    const rowCount = Math.max(...table.cells.map(cell => cell.RowIndex));
    const colCount = Math.max(...table.cells.map(cell => cell.ColumnIndex));
    
    // Initialize data arrays
    const originalData = Array(rowCount).fill(null)
      .map(() => Array(colCount).fill(''));
    
    // Create cell metadata structure
    const cellMetadata = Array(rowCount).fill(null)
      .map(() => Array(colCount).map(() => ({
        confidence: 0,
        boundingBox: null,
        content: '',
        rowIndex: 0,
        columnIndex: 0,
        isHeader: false,
        relationships: []
    })));

    console.log(`Found ${tableBlocks.size} tables`);  

    // Fill in cell data and metadata
    table.cells.forEach(cell => {
      const rowIdx = cell.RowIndex - 1;
      const colIdx = cell.ColumnIndex - 1;
      
      // Get cell content from relationships
      let content = '';
      if (cell.Relationships) {
          const childIds = cell.Relationships
              .filter(rel => rel.Type === 'CHILD')
              .flatMap(rel => rel.Ids);
          
          // Log for debugging
          console.log(`Processing cell [${rowIdx},${colIdx}]:`, {
              childCount: childIds.length,
              childTypes: childIds.map(id => blocks.find(b => b.Id === id)?.BlockType).filter(t => t)
          });

          // Get all WORD blocks within the cell
          const words = childIds
              .map(id => blocks.find(b => b.Id === id))
              .filter(b => b && b.BlockType === 'WORD')
              .map(b => b.Text);
          
          content = words.join(' ');
          console.log(`Cell [${rowIdx},${colIdx}] content:`, content);
      }

      if (!content && cell.Text) {
          // Fallback to direct cell text if available
          content = cell.Text;
          console.log(`Using direct cell text for [${rowIdx},${colIdx}]:`, content);
      }

      console.log(`Setting content for cell [${rowIdx},${colIdx}]:`, content);

      originalData[rowIdx][colIdx] = content;
      cellMetadata[rowIdx][colIdx] = {
        confidence: cell.Confidence,
        boundingBox: cell.Geometry.BoundingBox,
        content,
        rowIndex: rowIdx,
        columnIndex: colIdx,
        isHeader: rowIdx === 0, // Assume first row is header
        relationships: cell.Relationships || []
      };
    });

    

    return {
      boundingBox: table.Geometry.BoundingBox,
      pageNumber: table.Page,
      caption: table.caption,
      structure: {
        rowCount,
        columnCount: colCount,
        headerRowCount: 1, // Default to 1
        mergedCells: [],
        highlights: []
      },
      originalData,
      currentData: originalData.map(row => [...row]), // Create a copy
      textractMetadata: {
        table: {
          confidence: table.Confidence,
          blockId: table.Id,
          relationships: table.Relationships || []
        },
        cells: cellMetadata
      },
      processingStatus: 'completed',
      processingConfidence: table.Confidence
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