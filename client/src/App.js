import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Map from './pages/Map';
import About from './pages/About';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminLogin from './components/Auth/AdminLogin';
import Admin from './pages/Admin';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import mapboxgl from 'mapbox-gl';
import ContactPage from './pages/contact';
import LoginPage from '../src/components/Forms/LoginPage';
import RegisteredUserHome from '../src/pages/RegisteredUserHome';
import ResetPassword from './components/ResetPassword';
// Access environment variable properly
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

// Add error handling for missing token
if (!process.env.REACT_APP_MAPBOX_TOKEN) {
  console.error('Mapbox token is missing. Please check your environment variables.');
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/user-login" element={<LoginPage />} />
          <Route path="/home" element={<RegisteredUserHome />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute adminRequired={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
