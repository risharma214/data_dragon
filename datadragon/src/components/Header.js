import React from 'react';
import { Link } from 'react-router-dom';  // Import Link for navigation
import ddLogo from '../assets/ddlogo.png';
import ddLogow from '../assets/ddlogowhite.png';

function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 flex items-center justify-between">
      {/* Logo Section */}
      <div className="flex items-center">
        <img
          src={ddLogow} // Replace with your logo path
          alt="Logo"
          className="h-20 w-20 mr-3"
        />
        <span className="text-4xl font-bold text-white">DataDragon</span>
      </div>

      {/* Navigation Section */}
      <nav>
        <Link
          to="/"  // Link to HomePage
          className="font-bold text-xl text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
        >
          Home
        </Link>
        <Link
          to="/editor"  // Link to Editor page
          className="font-bold text-xl text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Edit
        </Link>
      </nav>
    </header>
  );
}

export default Header;
