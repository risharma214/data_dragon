import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { 
  ChevronUp,
  ChevronDown,
  Save,
  Download,
  Edit2,
  ArrowLeft,
  Eye,
  Table,
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid,
  Merge,
  Copy,
  Scissors,
  Moon,
  Sun
} from 'lucide-react';

const ProjectEditor = () => {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCell, setActiveCell] = useState({ row: null, col: null });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [tables, setTables] = useState([]);
  const [currentTableData, setCurrentTableData] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [showHighlightMenu, setShowHighlightMenu] = useState(null);
  const [pdfViewerInstance, setPdfViewerInstance] = useState(null);
  const { jumpToPage } = pageNavigationPluginInstance;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project data');
        
        const data = await response.json();

        // console.log('Full Project data:', data);

        setProjectData(data);
        
        if (data.files && data.files.length > 0) {
          const currentFile = fileId 
            ? data.files.find(f => f.id === fileId)
            : data.files[0];
            
          if (currentFile?.tables?.length > 0) {
            const sortedTables = [...currentFile.tables].sort((a, b) => {
              if (a.pageNumber !== b.pageNumber) {
                return a.pageNumber - b.pageNumber;
              }
              // If on same page, can add additional sorting logic here
              return 0;
            });
            setTables(sortedTables);
            setSelectedTable(sortedTables[0].id);
          }
        }

      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }


    };

    fetchProjectData();
  }, [projectId, fileId]);

  useEffect(() => {
    const fetchTableData = async () => {
      if (!selectedTable) {
        console.log('No table selected');
        return;
      }

      setActiveCell({ row: null, col: null });
      
      try {
        console.log('Fetching data for table:', selectedTable);
        const response = await fetch(`http://localhost:3001/api/tables/${selectedTable}`);
        if (!response.ok) throw new Error('Failed to fetch table data');
        
        const data = await response.json();
        // console.log('Received table data structure:', {
        //   currentData: data.currentData ? `${data.currentData.length}x${data.currentData[0]?.length}` : 'none',
        //   originalData: data.originalData ? `${data.originalData.length}x${data.originalData[0]?.length}` : 'none',
        //   structure: data.structure
        // });
        setCurrentTableData(data);

        const highlightMap = {};
        data.structure?.highlights?.forEach(h => {
          highlightMap[`${h.row}-${h.col}`] = h.color;
        });
        setHighlights(highlightMap);

        if (data.pageNumber) {
          setCurrentPage(data.pageNumber);
        }
      } catch (err) {
        console.error('Error fetching table data:', err);
        setError('Failed to load table data');
      }
    };
  
    fetchTableData();
  }, [selectedTable]);


  useEffect(() => {
    const fetchPdfUrl = async () => {
      const targetFileId = fileId || projectData?.files?.[0]?.id;
      if (!targetFileId) return;

      try {
        const response = await fetch(`http://localhost:3001/api/files/${targetFileId}/url`);
        if (!response.ok) throw new Error('Failed to fetch file URL');
        
        const data = await response.json();
        setPdfUrl(data.url);
      } catch (err) {
        console.error('Error fetching PDF URL:', err);
        setError('Failed to load PDF file');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPdfUrl();
  }, [fileId, projectData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !isCleaningUp) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
  
    const handleNavigation = (e) => {
      if (hasUnsavedChanges && !isCleaningUp) {
        if (!window.confirm('You have unsaved changes. Do you want to leave without saving?')) {
          e.preventDefault();
        } else {
          setIsCleaningUp(true);
        }
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigation);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [hasUnsavedChanges, isCleaningUp]);


  const handleHighlight = (rowIndex, colIndex, color) => {
    setHighlights(prev => {
      const key = `${rowIndex}-${colIndex}`;
      const newHighlights = { ...prev };
      
      if (newHighlights[key] === color) {
        delete newHighlights[key];
      } else {
        newHighlights[key] = color;
      }
      
      setHasUnsavedChanges(true);
      return newHighlights;
    });
  };

  const HighlightMenu = ({ onSelect, onRemove }) => (
    <div className={`absolute top-full left-0 mt-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-1 z-50`}>
      <div className="grid grid-cols-4 gap-1">
        {['#ffeb3b', '#4caf50', '#f44336', '#2196f3'].map(color => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <button
        onClick={onRemove}
        className={`w-full mt-1 px-2 py-1 text-xs ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'} rounded`}
      >
        Remove
      </button>
    </div>
  );

  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to leave without saving?')) {
        setIsCleaningUp(true);
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };


  const handleTableSelect = (tableId) => {

    setActiveCell({ row: null, col: null });

    // console.log('Table selected:', tableId);

    setSelectedTable(tableId);
    
    const selectedTable = tables.find(t => t.id === tableId);
    
    if (selectedTable) {
      jumpToPage(selectedTable.pageNumber - 1);
    }
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    if (!currentTableData) return;

    const newData = [...currentTableData.currentData];
    newData[rowIndex][colIndex] = value;
    setCurrentTableData({
      ...currentTableData,
      currentData: newData
    });
    setHasUnsavedChanges(true);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    setActiveCell({ row: rowIndex, col: colIndex });
  };

  // const handleSave = async () => {
  //   if (!selectedTable || !currentTableData) return;
  
  //   try {
  //     const response = await fetch(`http://localhost:3001/api/tables/${selectedTable}`, {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         currentData: currentTableData.currentData,
  //         structure: currentTableData.structure
  //       })
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('Failed to save changes');
  //     }
  
  //     setHasUnsavedChanges(false);

  //     console.log('Saved table');
  //     // Optional: Show success message
  //   } catch (error) {
  //     console.error('Error saving table:', error);
  //     // Show error message to user
  //   }
  // };

  const handleSave = async () => {
    if (!selectedTable || !currentTableData) return;
  
    try {
      const highlightArray = Object.entries(highlights).map(([key, color]) => {
        const [row, col] = key.split('-');
        return {
          row: parseInt(row),
          col: parseInt(col),
          color
        };
      });
  
      const response = await fetch(`http://localhost:3001/api/tables/${selectedTable}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentData: currentTableData.currentData,
          structure: {
            ...currentTableData.structure,
            highlights: highlightArray
          }
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to save changes');
      }
  
      setHasUnsavedChanges(false);
      console.log('Saved table');
    } catch (error) {
      console.error('Error saving table:', error);
    }
  };

  // const addRow = () => {
  //   if (!currentTableData) return;
    
  //   const newData = [...currentTableData.currentData];
  //   const newRow = new Array(currentTableData.structure.columnCount).fill('');
  //   newData.push(newRow);
    
  //   setCurrentTableData({
  //     ...currentTableData,
  //     currentData: newData,
  //     structure: {
  //       ...currentTableData.structure,
  //       rowCount: currentTableData.structure.rowCount + 1
  //     }
  //   });
  // };

  const addRow = () => {
    if (!currentTableData) return;
    
    const newData = [...currentTableData.currentData];
    const newRow = new Array(currentTableData.structure.columnCount).fill('');
    
    if (activeCell.row !== null) {
      // Insert after the active row
      newData.splice(activeCell.row + 1, 0, newRow);
      // Update active cell to the new row
      setActiveCell({ row: activeCell.row + 1, col: activeCell.col });
    } else {
      // Add to the end if no row is selected
      newData.push(newRow);
    }
    
    setCurrentTableData({
      ...currentTableData,
      currentData: newData,
      structure: {
        ...currentTableData.structure,
        rowCount: currentTableData.structure.rowCount + 1
      }
    });
    
    setHasUnsavedChanges(true);
  };

  const deleteRow = (rowIndex) => {
    if (!currentTableData) return;
    
    const newData = currentTableData.currentData.filter((_, index) => index !== rowIndex);
    
    setCurrentTableData({
      ...currentTableData,
      currentData: newData,
      structure: {
        ...currentTableData.structure,
        rowCount: currentTableData.structure.rowCount - 1
      }
    });
    
    if (activeCell.row === rowIndex) {
      setActiveCell({ row: null, col: null });
    }
  };

  const addColumn = () => {
    if (!currentTableData) return;
    
    const newData = currentTableData.currentData.map(row => {
      const newRow = [...row];
      if (activeCell.col !== null) {
        // Insert after the active column
        newRow.splice(activeCell.col + 1, 0, '');
      } else {
        // Add to the end if no column is selected
        newRow.push('');
      }
      return newRow;
    });
    
    if (activeCell.col !== null) {
      // Update active cell to the new column
      setActiveCell({ row: activeCell.row, col: activeCell.col + 1 });
    }
    
    setCurrentTableData({
      ...currentTableData,
      currentData: newData,
      structure: {
        ...currentTableData.structure,
        columnCount: currentTableData.structure.columnCount + 1
      }
    });
    
    setHasUnsavedChanges(true);
  };
  
  const deleteColumn = (colIndex) => {
    if (!currentTableData) return;
    
    const newData = currentTableData.currentData.map(row => {
      const newRow = [...row];
      newRow.splice(colIndex, 1);
      return newRow;
    });
    
    setCurrentTableData({
      ...currentTableData,
      currentData: newData,
      structure: {
        ...currentTableData.structure,
        columnCount: currentTableData.structure.columnCount - 1
      }
    });
    
    if (activeCell.col === colIndex) {
      setActiveCell({ row: activeCell.row, col: null });
    } else if (activeCell.col > colIndex) {
      // Adjust active cell if it was after the deleted column
      setActiveCell({ row: activeCell.row, col: activeCell.col - 1 });
    }
    
    setHasUnsavedChanges(true);
  };

  const downloadCSV = () => {
    if (!currentTableData || !currentTableData.currentData) return;
  
    const { currentData, structure } = currentTableData;
  
    // Convert table data to CSV format
    const csvContent = [
      Array.from({ length: structure.columnCount }, (_, i) => String.fromCharCode(65 + i)).join(","), // Header row
      ...currentData.map(row => row.map(cell => `"${cell || ""}"`).join(",")) // Data rows
    ].join("\n");
  
    // Create a blob and trigger a download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "table_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderPdfViewer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          {error}
        </div>
      );
    }
  
    if (!pdfUrl) {
      return (
        <div className={`flex items-center justify-center h-full ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No PDF selected
        </div>
      );
    }
  
    return (
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="h-full relative">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance, pageNavigationPluginInstance]}
            defaultScale={1.0}
            onPageChange={(e) => setCurrentPage(e.currentPage)}
            theme={isDarkMode ? 'dark' : 'light'}
          />
        </div>
      </Worker>
    );
  };

  const renderGrid = () => {
    // console.log('Rendering grid with currentTableData:', {
    //   hasData: !!currentTableData,
    //   currentData: currentTableData?.currentData 
    //     ? `${currentTableData.currentData.length}x${currentTableData.currentData[0]?.length}` 
    //     : 'none',
    //   firstRow: currentTableData?.currentData?.[0],
    //   structure: currentTableData?.structure
    // });
  
    if (!currentTableData) return null;
  
    const { currentData, structure } = currentTableData;
    const columns = Array.from(
      { length: structure.columnCount }, 
      (_, i) => String.fromCharCode(65 + i)
    );
  
    return (
      <div className="relative"> 
          {/* Column Headers */}
          <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-b flex`}>
            <div className={`sticky left-0 z-20 w-10 h-8 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-400'} flex items-center justify-center  text-sm`}></div>
            {columns.map(col => (
              <div key={col} className={`w-40 h-8 border-r ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'} flex items-center justify-center  text-sm font-medium`}>
                {col}
              </div>
            ))}
          </div>
    
          {/* Grid Content */}
          <div>
            {currentData.map((row, rowIndex) => (
              <div key={rowIndex} className={`flex group ${
                activeCell.row === rowIndex ? isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50' : ''
              }`}>
                {/* Row Header */}
                <div className={`sticky left-0 z-10 w-10 h-8 border-r border-b ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'} flex items-center justify-center text-sm font-medium`}>
                  <div className="flex items-center gap-1">
                    <span>{rowIndex + 1}</span>
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="invisible group-hover:visible text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                
                {/* Row Data */}
                {row.map((cell, colIndex) => {
                  const highlightKey = `${rowIndex}-${colIndex}`;
                  const highlightColor = highlights[highlightKey];
                  const cellConfidence = currentTableData.textractMetadata?.cells?.[rowIndex]?.[colIndex]?.confidence || 100;
                  const isLowConfidence = cellConfidence < 80;  // Threshold for confidence

                  return (
                    <div 
                      key={colIndex} 
                      className={`w-40 h-8 border-r border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} relative ${
                        activeCell.col === colIndex && activeCell.row !== rowIndex ? isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      style={{
                        backgroundColor: highlightColor ? `${highlightColor}40` : // 40 is hex for 25% opacity
                                        isLowConfidence ? '#f4433640' : 
                                        undefined
                      }}
                    >
                      <input
                        type="text"
                        value={cell || ''}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className={`w-full h-full px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isDarkMode ? 'bg-transparent text-gray-300' : 'bg-transparent'
                        }
                        ${
                          activeCell.row === rowIndex && activeCell.col === colIndex
                            ? 'bg-transparent ring-1 ring-blue-500'
                            : 'bg-transparent'
                        }`}
                      />
                      {activeCell.row === rowIndex && activeCell.col === colIndex && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHighlightMenu(`${rowIndex}-${colIndex}`);
                          }}
                          className={`absolute top-1 right-1 w-4 h-4 rounded-full ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center`}
                        >
                          <span className="block w-2 h-2 rounded-full" style={{ 
                            backgroundColor: highlightColor || 'white' 
                          }} />
                        </button>
                      )}
                      {showHighlightMenu === `${rowIndex}-${colIndex}` && (
                        <HighlightMenu 
                          onSelect={(color) => {
                            handleHighlight(rowIndex, colIndex, color);
                            setShowHighlightMenu(null);
                          }}
                          onRemove={() => {
                            handleHighlight(rowIndex, colIndex, null);
                            setShowHighlightMenu(null);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        {/* </div> */}
      </div>
    );
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'} pb-12`}>
      <header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'}`}>
        <div className="flex items-center h-14 px-4 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackNavigation}
              className={`hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className={`text-lg font-semibold bg-gradient-to-r ${isDarkMode ? 'from-yellow-300 via-green-400 to-blue-500':'from-pink-500 via-blue-500 to-purple-500'} bg-clip-text text-transparent `}>
              DigiTables
            </div>
          </div>

          {/* <input
            type="text"
            defaultValue={projectData?.name || "Loading..."}
            className="text-gray-900 font-medium px-3 py-1 border border-transparent rounded-lg hover:bg-gray-50 focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          /> */}
          <input
            type="text"
            value={projectData?.name || "Loading..."}
            readOnly
            className={`${isDarkMode ? 'text-gray-200 hover:bg-gray-800 bg-gray-800 focus:border-gray-800' : 'text-gray-900 hover:bg-gray-50 focus:border-gray-200'} 
            font-medium px-3 py-1 border border-transparent rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:border-gray-600`}/>


          <div className="flex items-center gap-3 ml-auto">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3 py-1.5 text-sm ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-50'
              } rounded-lg transition-colors flex items-center gap-2`}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button 
              onClick={handleSave}
              className={`px-3 py-1.5 text-sm ${
                hasUnsavedChanges 
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-black text-white hover:bg-gray-900'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } rounded-lg transition-colors flex items-center gap-2`}
              disabled={!hasUnsavedChanges}
            >
              <Save size={16} />
              {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </button>
            {/* <button className="px-3 py-1.5 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
              <Download size={16} />
              Export
            </button> */}
            <button
              onClick={downloadCSV}
              className="px-3 py-1.5 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 
                dark:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-w-0">
        <div className="w-1/2 flex flex-col">
            <div className={`h-12 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100'} 
              flex items-center justify-between px-4`}>
              <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                Original PDF
              </span>
            </div>
            <div className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} overflow-hidden relative`}>
              <div className="absolute inset-0 overflow-auto">
                {renderPdfViewer()}
              </div>
            </div>
          </div>

        <div className={`w-1/2 flex flex-col ${isDarkMode ? 'border-gray-700' : ''} border-l h-full`}>
          <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <div className="h-12 px-4 flex items-center gap-4">
              <div className={`flex items-center gap-2 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pr-4`}>
                {/* Row Operations */}
                <button 
                  onClick={addRow}
                  className={`p-1.5 ${
                    isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                  } rounded-lg transition-colors group relative`}
                  title="Add Row"
                >
                  <Plus size={16} className="-rotate-90" />
                  <span className="sr-only">Add Row</span>
                </button>
                <button 
                  className={`p-1.5 ${
                    isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                  } rounded-lg transition-colors`}
                  title="Delete Selected Row"
                  onClick={() => activeCell.row !== null && deleteRow(activeCell.row)}
                >
                  <Trash2 size={16} className="-rotate-90" />
                  <span className="sr-only">Delete Row</span>
                </button>

                {/* Column Operations */}
                <button 
                  onClick={addColumn}
                  className={`p-1.5 ${
                    isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                  } rounded-lg transition-colors`}
                  title="Add Column"
                >
                  <Plus size={16} />
                  <span className="sr-only">Add Column</span>
                </button>
                <button 
                  className={`p-1.5 ${
                    isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                  } rounded-lg transition-colors`}
                  title="Delete Selected Column"
                  onClick={() => activeCell.col !== null && deleteColumn(activeCell.col)}
                >
                  <Trash2 size={16} />
                  <span className="sr-only">Delete Column</span>
                </button>
              </div>

              <div className={`flex items-center gap-2 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pr-4`}>
                <button className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                } rounded-lg transition-colors`}>
                  <Copy size={16} />
                </button>
                <button className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                } rounded-lg transition-colors`}>
                  <Scissors size={16} />
                </button>
              </div>

              <div className={`flex items-center gap-2 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pr-4`}>
                <button className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                } rounded-lg transition-colors`}>
                  <Merge size={16} />
                </button>
                <button className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                } rounded-lg transition-colors`}>
                  <Grid size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                } rounded-lg transition-colors`}>
                  <AlignLeft size={16} />
                </button>
                <button className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                } rounded-lg transition-colors`}>
                  <AlignCenter size={16} />
                </button>
                <button className={`p-1.5 ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                } rounded-lg transition-colors`}>
                  <AlignRight size={16} />
                </button>
              </div>
            </div>

            {/* <div className={`h-8 px-4 border-t ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'
            } flex items-center gap-2`}>
              <div className={`w-20 px-2 py-1 text-sm ${
                isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border'
              } rounded`}>A1</div>
              <div className={`flex-1 px-2 py-1 text-sm ${
                isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border'
              } rounded`}>
                fx
              </div>
            </div> */}

            {/* Formula/Text Editor Bar */}
            <div className={`h-8 px-4 border-t ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'
            } flex items-center gap-2`}>
              <div className={`w-20 px-2 py-1 text-sm ${
                isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border'
              } rounded`}>
                {activeCell.row !== null && activeCell.col !== null 
                  ? `${String.fromCharCode(65 + activeCell.col)}${activeCell.row + 1}`
                  : 'No cell'}
              </div>
              <input
                type="text"
                value={activeCell.row !== null && activeCell.col !== null 
                  ? (currentTableData?.currentData[activeCell.row][activeCell.col] || '')
                  : ''}
                onChange={(e) => {
                  if (activeCell.row !== null && activeCell.col !== null) {
                    handleCellChange(activeCell.row, activeCell.col, e.target.value);
                  }
                }}
                placeholder="Enter cell content"
                className={`flex-1 px-2 py-1 text-sm  ${isDarkMode? 'bg-gray-900 border-gray-700 text-gray-100':'bg-white border-gray-50' } border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400`}
                disabled={activeCell.row === null || activeCell.col === null}
              />
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden" style={{ height: 'calc(100vh - 8.5rem)' }}> {/* 8.5rem accounts for header + toolbar */}
            <div className="absolute inset-0 overflow-auto"> {/* pb-48 for thumbnail bar */}
              <div className="inline-block min-w-full">
                {renderGrid()}
              </div>
            </div>
          </div>

          {/* <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden pb-48"> 
              <div className="h-full overflow-auto">
                <div className="inline-block min-w-full"> 
                  {renderGrid()}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <div className={`border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'
        } transition-all duration-300 fixed bottom-0 left-0 right-0 z-10 ${sidebarOpen ? 'h-64' : 'h-12'}`}>
        <div className={`h-12 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between px-4`}>
          <div className="flex items-center gap-2">
            <Table size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-400'} />
            <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Tables</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
          >
            {sidebarOpen ? (
              <ChevronDown size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-400'} />
            ) : (
              <ChevronUp size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-400'} />
            )}
          </button>
        </div>

        {sidebarOpen && (
          <div className="overflow-x-auto p-4 whitespace-nowrap">
            <div className="flex gap-4">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table.id)}
                  className={`flex-none text-left transition-all ${
                    selectedTable === table.id
                      ? isDarkMode 
                        ? 'bg-gray-800 border-blue-500'
                        : 'bg-blue-50 border-blue-500'
                      : isDarkMode
                        ? 'hover:bg-gray-800 border-transparent'
                        : 'hover:bg-gray-50 border-transparent'
                  } border rounded-lg p-3 w-48`}
                >
                  <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} border ${
                isDarkMode ? 'border-gray-700' : ''} rounded-md h-20 mb-2 flex items-center justify-center text-gray-400`}>
                    <Table size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className={`font-medium text-sm truncate ${
                  isDarkMode ? 'text-gray-300' : ''
                }`}>
                      {table.caption?.text || `Table ${table.structure?.rowCount}x${table.structure?.columnCount}`}
                    </div>
                    <div className={`flex items-center justify-between text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      <span>Page {table.pageNumber}</span>
                      <span>{table.structure?.rowCount}x{table.structure?.columnCount}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectEditor;