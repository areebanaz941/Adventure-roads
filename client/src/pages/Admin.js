// src/pages/admin.js
import React from 'react';
import AdminMap from '../components/Map/AdminMap';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <AdminMap />
      </div>
    </div>
  );
};
export default Admin;