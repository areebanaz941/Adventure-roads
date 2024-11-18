// src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="absolute top-0 w-full z-50 bg-white/90">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/images/logo.png"  // Changed path to absolute path
            alt="Logo" 
            className="h-12 w-12 object-contain"  // Added width and object-contain
          />
          <span className="text-3xl text-[#436485] font-semibold tracking-wide">
            ADVENTUROADS
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="text-[#436485] hover:text-[#2c4359] font-medium transition-colors"
          >
            HOME
          </Link>
          <Link 
            to="/contact" 
            className="text-[#436485] hover:text-[#2c4359] font-medium transition-colors"
          >
            CONTACT
          </Link>

          <Link 
            to="/admin-login" 
            className="text-[#436485] hover:text-[#2c4359] font-medium transition-colors"
          >
            ADMIN 
          </Link>

          <Link 
            to="/comments" 
            className="text-[#436485] hover:text-[#2c4359] font-medium transition-colors"
          >
            COMMENTS
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;