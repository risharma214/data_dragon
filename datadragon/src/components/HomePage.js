import React from 'react';
import { Link } from 'react-router-dom';
import ddLogo from '../assets/ddlogo.png';
import ddLogow from '../assets/ddlogowhite.png';
import pdftoss from '../assets/pdftoss.png';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      {/* <header className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src={ddLogo} alt="DataDragon Logo" className="h-10 w-10 mr-2" />
            <span className="text-2xl font-bold">DataDragon</span>
          </div>
          <nav className="space-x-4">
            <Link to="/" className="hover:text-gray-400">Home</Link>
            <Link to="/editor" className="hover:text-gray-400">Editor</Link>
          </nav>
        </div>
      </header> */}

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="container mx-auto flex items-center justify-between py-16">
          {/* Left Side - Text */}
          <div className="w-1/2">
            <h1 className="text-4xl font-bold text-gray-800 leading-tight mb-6">
              Transform Your PDFs into Editable Data with <span className="text-blue-600">DataDragon</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Upload PDFs containing tabular data, automatically convert them into CSVs using OCR, and edit the scanned data side-by-side with the original PDF.
            </p>
            <Link to="/editor">
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200">
                Get Started
              </button>
            </Link>
          </div>

          {/* Right Side - Hero Image Placeholder */}
          <div className="w-1/2 flex justify-center">
            <img src={pdftoss} alt="OCR Process" className="w-96 h-auto object-cover rounded-lg" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="container mx-auto text-center">
          <p className="text-sm">&copy; 2024 DataDragon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
