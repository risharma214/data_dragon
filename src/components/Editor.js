import React, { useState, useCallback } from 'react';
import { Upload, Plus, Trash2, PlusCircle } from 'lucide-react';

const SpreadsheetEditor = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [activeCell, setActiveCell] = useState({ row: null, col: null });

  const processFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n');
      let headers = ['Column 1'];
      let parsedData = [['']];

      if (rows.length > 0 && rows[0].trim() !== '') {
        headers = rows[0].split(',').map(header => header.trim());
        parsedData = rows.slice(1)
          .map(row => row.split(',').map(cell => cell.trim()))
          .filter(row => row.some(cell => cell !== ''));
      }

      if (parsedData.length === 0) {
        parsedData = [new Array(headers.length).fill('')];
      }
      
      setHeaders(headers);
      setData(parsedData);
      setHasUploadedFile(true);
    };

    reader.readAsText(file);
  }, []);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleCellEdit = useCallback((rowIndex, colIndex, value) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[rowIndex][colIndex] = value;
      return newData;
    });
  }, []);

  const handleHeaderEdit = useCallback((colIndex, value) => {
    setHeaders(prevHeaders => {
      const newHeaders = [...prevHeaders];
      newHeaders[colIndex] = value;
      return newHeaders;
    });
  }, []);

  const handleCellClick = useCallback((rowIndex, colIndex) => {
    setActiveCell({ row: rowIndex, col: colIndex });
  }, []);

  const addRow = useCallback(() => {
    setData(prevData => [...prevData, new Array(headers.length).fill('')]);
  }, [headers.length]);

  const deleteRow = useCallback((rowIndex) => {
    setData(prevData => {
      const newData = prevData.filter((_, index) => index !== rowIndex);
      if (newData.length === 0) {
        return [new Array(headers.length).fill('')];
      }
      return newData;
    });
    if (activeCell.row === rowIndex) {
      setActiveCell({ row: null, col: null });
    }
  }, [headers.length, activeCell]);

  const addColumn = useCallback(() => {
    setHeaders(prevHeaders => [...prevHeaders, `Column ${prevHeaders.length + 1}`]);
    setData(prevData => prevData.map(row => [...row, '']));
  }, []);

  const deleteColumn = useCallback((colIndex) => {
    setHeaders(prevHeaders => prevHeaders.filter((_, index) => index !== colIndex));
    setData(prevData => prevData.map(row => row.filter((_, index) => index !== colIndex)));
    if (activeCell.col === colIndex) {
      setActiveCell({ row: null, col: null });
    }
  }, [activeCell]);

  const downloadCSV = useCallback(() => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [headers, data]);

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <div className="mb-8">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-600 mb-2">Select a CSV file to upload</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
              <Upload size={20} />
              Select File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {hasUploadedFile && (
        <div className="mb-4 flex gap-4 flex-wrap">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Download CSV
          </button>

          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            <Plus size={20} />
            Add Row
          </button>

          <button
            onClick={addColumn}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            <PlusCircle size={20} />
            Add Column
          </button>
        </div>
      )}

      {headers.length > 0 && (
        <div className="border rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group relative
                      ${activeCell.col === index ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderEdit(index, e.target.value)}
                        className="w-full border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded p-1"
                      />
                      <button
                        onClick={() => deleteColumn(index)}
                        className="invisible group-hover:visible text-red-500 hover:text-red-700"
                        title="Delete column"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`group ${activeCell.row === rowIndex ? 'bg-blue-50' : ''}`}
                >
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-6 py-4 whitespace-nowrap
                        ${activeCell.col === colIndex && activeCell.row !== rowIndex ? 'bg-blue-50' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                        className="w-full border-0 focus:ring-2 focus:ring-blue-500 rounded p-1 bg-transparent"
                      />
                    </td>
                  ))}
                  <td className="px-2 invisible group-hover:visible">
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetEditor;