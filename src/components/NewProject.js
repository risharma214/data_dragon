import React, { useState } from 'react';
import { 
  Upload,
  FileText,
  Table,
  ArrowLeft,
  X,
  Loader2,
  Image
} from 'lucide-react';

const NewProjectPage = ({ onBack, onComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file drop
  };

  const handleUpload = async () => {
    setProcessing(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Gradients */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-500/5 via-blue-500/5 to-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tl from-pink-500/5 via-blue-500/5 to-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"
        aria-hidden="true"
      />

      {/* Navigation */}
      <nav className="relative border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button 
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              DigiTables
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Start a New Project</h1>
          <p className="text-gray-600">Choose what you want to start with</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* PDF Upload Option */}
          <div className="relative group">
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <div className="h-full bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500/20 hover:bg-blue-50/5 transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FileText size={24} className="text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">PDF with Tables</h3>
              <p className="text-sm text-gray-500 mb-4">Upload a PDF file and we'll automatically detect and extract all tables</p>
              <span className="text-xs text-gray-400">Drag & drop or click to upload</span>
            </div>
          </div>

          {/* Image Upload Option */}
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <div className="h-full bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500/20 hover:bg-blue-50/5 transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Image size={24} className="text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Image of a Table</h3>
              <p className="text-sm text-gray-500 mb-4">Upload an image containing a table and we'll convert it to editable data</p>
              <span className="text-xs text-gray-400">Drag & drop or click to upload</span>
            </div>
          </div>

          {/* CSV Upload Option */}
          <div className="relative group">
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <div className="h-full bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500/20 hover:bg-blue-50/5 transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <Table size={24} className="text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Import CSV</h3>
              <p className="text-sm text-gray-500 mb-4">Already have structured data? Import it directly from a CSV file</p>
              <span className="text-xs text-gray-400">Drag & drop or click to upload</span>
            </div>
          </div>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="mt-8">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {processing ? (
                  <div className="flex items-center gap-2 text-blue-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                    <button
                      onClick={handleUpload}
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Upload
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Drop Zone Overlay */}
        {dragActive && (
          <div 
            className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center">
              <Upload size={32} className="text-blue-500 mb-4" />
              <p className="text-lg font-medium">Drop your file here</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewProjectPage;