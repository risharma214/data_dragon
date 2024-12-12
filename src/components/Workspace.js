import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
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
  Scissors
} from 'lucide-react';

const ProjectEditor = () => {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [tables, setTables] = useState([]);
  const [currentTableData, setCurrentTableData] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
  
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project data');
        
        const data = await response.json();
        setProjectData(data);
        
        if (fileId) {
          const currentFile = data.files.find(file => file.id === fileId);
          if (currentFile?.tables?.length > 0) {
            setTables(currentFile.tables);
            setSelectedTable(currentFile.tables[0].id);
          }
        } else if (data.files?.length > 0) {
          const firstFile = data.files[0];
          setTables(firstFile.tables || []);
          if (firstFile.tables?.length > 0) {
            setSelectedTable(firstFile.tables[0].id);
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
      if (!selectedTable) return;
      
      try {
        const response = await fetch(`http://localhost:3001/api/tables/${selectedTable}`);
        if (!response.ok) throw new Error('Failed to fetch table data');
        
        const data = await response.json();
        setCurrentTableData(data);
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

  const handleBackNavigation = () => {
    navigate('/dashboard');
  };

  const handleTableSelect = (tableId) => {
    setSelectedTable(tableId);
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    if (!currentTableData) return;

    const newData = [...currentTableData.currentData];
    newData[rowIndex][colIndex] = value;
    setCurrentTableData({
      ...currentTableData,
      currentData: newData
    });
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
        <div className="flex items-center justify-center h-full text-gray-500">
          No PDF selected
        </div>
      );
    }
  
    return (
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="h-full relative">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
            defaultScale={1.0}
            onPageChange={(e) => setCurrentPage(e.currentPage)}
          />
        </div>
      </Worker>
    );
  };

  const renderGrid = () => {
    if (!currentTableData) return null;

    const { currentData, structure } = currentTableData;
    const columns = Array.from(
      { length: structure.columnCount }, 
      (_, i) => String.fromCharCode(65 + i)
    );

    return (
      <div className="min-w-full inline-block">
        <div className="sticky top-0 bg-gray-50 border-b flex">
          <div className="w-10 h-8 border-r border-gray-200 flex items-center justify-center text-gray-400 text-sm"></div>
          {columns.map(col => (
            <div key={col} className="w-40 h-8 border-r border-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
              {col}
            </div>
          ))}
        </div>

        <div>
          {currentData.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              <div className="w-10 h-8 border-r border-b border-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium bg-gray-50 sticky left-0">
                {rowIndex + 1}
              </div>
              {row.map((cell, colIndex) => (
                <div key={colIndex} className="w-40 h-8 border-r border-b border-gray-200">
                  <input
                    type="text"
                    value={cell || ''}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    className="w-full h-full px-2 focus:outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100 bg-white">
        <div className="flex items-center h-14 px-4 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackNavigation}
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="text-lg font-semibold bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              DigiTables
            </div>
          </div>

          <input
            type="text"
            defaultValue={projectData?.name || "Loading..."}
            className="text-gray-900 font-medium px-3 py-1 border border-transparent rounded-lg hover:bg-gray-50 focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="flex items-center gap-3 ml-auto">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2">
              <Eye size={16} />
              Preview
            </button>
            <button className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2">
              <Save size={16} />
              Save
            </button>
            <button className="px-3 py-1.5 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-w-0">
        <div className="w-1/2 flex flex-col">
          <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4">
            <span className="font-medium text-sm">Original PDF</span>
          </div>
          <div className="flex-1 bg-gray-50 overflow-hidden relative"> 
          <div className="absolute inset-0 overflow-auto"> 
            {renderPdfViewer()}
          </div>
        </div>
        </div>

        <div className="w-1/2 flex flex-col border-l">
          <div className="border-b border-gray-100 bg-white">
            <div className="h-12 px-4 flex items-center gap-4">
              <div className="flex items-center gap-2 border-r pr-4">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <Plus size={16} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 border-r pr-4">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <Copy size={16} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <Scissors size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 border-r pr-4">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <Merge size={16} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <Grid size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <AlignLeft size={16} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <AlignCenter size={16} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                  <AlignRight size={16} />
                </button>
              </div>
            </div>

            <div className="h-8 px-4 border-t border-gray-100 flex items-center gap-2 bg-gray-50">
              <div className="w-20 px-2 py-1 text-sm bg-white border rounded">A1</div>
              <div className="flex-1 px-2 py-1 text-sm bg-white border rounded">
                fx
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {renderGrid()}
          </div>
        </div>
      </div>

      <div className={`border-t border-gray-100 bg-white transition-all duration-300 ${sidebarOpen ? 'h-48' : 'h-12'}`}>
        <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Table size={16} className="text-gray-400" />
            <span className="font-medium text-sm">Tables</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronUp size={16} className="text-gray-400" />
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
                      ? 'bg-blue-50 border-blue-500'
                      : 'hover:bg-gray-50 border-transparent'
                  } border rounded-lg p-3 w-48`}
                >
                  <div className="bg-white border rounded-md h-20 mb-2 flex items-center justify-center text-gray-400">
                    <Table size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-sm truncate">
                      Table {table.structure?.rowCount}x{table.structure?.columnCount}
                    </div>
                    <div className="text-xs text-gray-500">Page {table.pageNumber}</div>
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