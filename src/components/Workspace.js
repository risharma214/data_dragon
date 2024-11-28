import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams } from 'react-router-dom';
import { 
  ChevronUp,
  ChevronDown,
  Save,
  Download,
  Settings,
  Edit2,
  ArrowLeft,
  Eye,
  Table,
  Maximize2,
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Grid,
  Merge,
  Copy,
  Scissors
} from 'lucide-react';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ProjectEditor = () => {
  const { projectId, fileId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTable, setSelectedTable] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Your existing mock data
  const tables = [
    {
      id: 1,
      caption: "Table 1.2: Compression Results for Level 0",
      page: 4,
      data: [
        { name: 'marbles.bmp', originalSize: 4264316, compressedSize: 4264488, ratio: '0%', time: 0.722 },
        { name: 'ray.bmp', originalSize: 1440054, compressedSize: 1440218, ratio: '0%', time: 0.309 },
        { name: 'big.txt', originalSize: 6488666, compressedSize: 6488830, ratio: '0%', time: 0.175 }
      ]
    },
    {
      id: 2,
      caption: "Table 1.3: Compression Results for Level 1",
      page: 4,
      data: [
        { name: 'marbles.bmp', originalSize: 4264316, compressedSize: 2583093, ratio: '40%', time: 0.218 },
        { name: 'ray.bmp', originalSize: 1440054, compressedSize: 331253, ratio: '77%', time: 0.085 },
        { name: 'big.txt', originalSize: 6488666, compressedSize: 2848375, ratio: '57%', time: 1.673 }
      ]
    }
  ];

  // Fetch PDF URL when component mounts
  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/files/${fileId}/url`);
        if (!response.ok) throw new Error('Failed to fetch file URL');
        
        const data = await response.json();
        setPdfUrl(data.url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfUrl();
  }, [fileId]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-100 bg-white">
        <div className="flex items-center h-14 px-4 gap-6">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button className="hover:bg-gray-100 p-2 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="text-lg font-semibold bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              DigiTables
            </div>
          </div>

          {/* Center section - Project name */}
          <input
            type="text"
            defaultValue="Compression Analysis"
            className="text-gray-900 font-medium px-3 py-1 border border-transparent rounded-lg hover:bg-gray-50 focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          {/* Right section */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 relative">
        {/* Split View */}
        <div className="flex-1 flex">
          {/* PDF Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4">
              <span className="font-medium text-sm">Original PDF</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {numPages}
                </span>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <Maximize2 size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 bg-gray-50 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-red-500">
                  {error}
                </div>
              ) : (
                <div className="flex justify-center">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    }
                    error={
                      <div className="text-red-500">Failed to load PDF file.</div>
                    }
                  >
                    <Page 
                      pageNumber={currentPage} 
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-lg"
                    />
                  </Document>
                </div>
              )}
            </div>
          </div>

          {/* Spreadsheet Editor - Keep your existing implementation */}
          <div className="w-1/2 flex flex-col border-l">
            {/* ... Your existing spreadsheet editor code ... */}
            {/* Keeping all the toolbar, grid, etc. exactly as in your reference */}
            {/* Spreadsheet Toolbar */}
            <div className="border-b border-gray-100 bg-white">
              {/* Main Tools */}
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

              {/* Formula/Cell Info Bar */}
              <div className="h-8 px-4 border-t border-gray-100 flex items-center gap-2 bg-gray-50">
                <div className="w-20 px-2 py-1 text-sm bg-white border rounded">A1</div>
                <div className="flex-1 px-2 py-1 text-sm bg-white border rounded">
                  fx
                </div>
              </div>
            </div>

            {/* Spreadsheet Grid */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-full inline-block">
                {/* Column Headers */}
                <div className="sticky top-0 bg-gray-50 border-b flex">
                  <div className="w-10 h-8 border-r border-gray-200 flex items-center justify-center text-gray-400 text-sm"></div>
                  {['A', 'B', 'C', 'D', 'E'].map(col => (
                    <div key={col} className="w-40 h-8 border-r border-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                      {col}
                    </div>
                  ))}
                </div>

                {/* Grid Content */}
                <div>
                  {tables[selectedTable].data.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {/* Row Header */}
                      <div className="w-10 h-8 border-r border-b border-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium bg-gray-50 sticky left-0">
                        {rowIndex + 1}
                      </div>
                      {/* Row Data */}
                      {Object.values(row).map((cell, cellIndex) => (
                        <div key={cellIndex} className="w-40 h-8 border-r border-b border-gray-200">
                          <input
                            type="text"
                            defaultValue={cell}
                            className="w-full h-full px-2 focus:outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnails Bar */}
      <div className={`border-t border-gray-100 bg-white transition-all duration-300 ${sidebarOpen ? 'h-48' : 'h-12'}`}>
        {/* Thumbnails Header */}
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

        {/* Horizontal Thumbnails List */}
        {sidebarOpen && (
          <div className="overflow-x-auto p-4 whitespace-nowrap">
            <div className="flex gap-4">
              {tables.map((table, index) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(index)}
                  className={`flex-none text-left transition-all ${
                    selectedTable === index
                      ? 'bg-blue-50 border-blue-500'
                      : 'hover:bg-gray-50 border-transparent'
                  } border rounded-lg p-3 w-48`}
                >
                  <div className="bg-white border rounded-md h-20 mb-2 flex items-center justify-center text-gray-400">
                    <Table size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-sm truncate">{table.caption}</div>
                    <div className="text-xs text-gray-500">Page {table.page}</div>
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