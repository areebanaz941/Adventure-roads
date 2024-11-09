// src/components/Map/AdminMap.js
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const AdminDashboard = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [currentStyle, setCurrentStyle] = useState('satellite');
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.satellite,
      center: [133.7751, -25.2744],
      zoom: 4,
      projection: 'globe',
      renderWorldCopies: false
    });

    map.current.on('style.load', () => {
      map.current.setFog({
        color: 'rgb(0, 0, 0)',
        'high-color': 'rgb(20, 20, 40)',
        'horizon-blend': 0.2
      });
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      }),
      'bottom-right'
    );
  }, []);

  const changeMapStyle = (style) => {
    map.current.setStyle(MAP_STYLES[style]);
    setCurrentStyle(style);
    setIsStyleMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-2xl text-[#436485]">ADVENTUROADS</span>
          </div>
          <nav className="flex space-x-6">
            <a href="/" className="text-[#436485]">HOME</a>
            <a href="/contact" className="text-[#436485]">CONTACT</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-72 bg-[#d2d2d3] border-r border-gray-200">
          <div className="bg-[#4B8BF4] text-white p-2 flex justify-between items-center">
            <h3 className="font-bold">Route Info</h3>
            <button className="hover:bg-blue-600 px-2 rounded">▼</button>
          </div>
          <div className="p-4">
            <p className="text-gray-900">Select a Route/POI to see details.</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Control Panel */}
          <div className="bg-[#4B8BF4] text-white p-2 flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm flex items-center">
                ⬆️ Upload GPX
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                SAVE IN DATABASE
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Split Selected Line to Chunks
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Split Selected Line at Clicked Point
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Calculate Route Between
              </button>
            </div>

            {/* Map style selector */}
            <div className="relative">
                <button 
                  onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm flex items-center"
                >
                  Base Map ▼
                </button>
                {isStyleMenuOpen && (
                  <div className="absolute right-0 mt-1 bg-white rounded shadow-lg z-50">
                    <button
                      onClick={() => changeMapStyle('satellite')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Satellite
                    </button>
                    <button
                      onClick={() => changeMapStyle('streets')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Streets
                    </button>
                    <button
                      onClick={() => changeMapStyle('satelliteStreets')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Satellite with Streets
                    </button>
                  </div>
                )}
              </div>
            </div>

          {/* Map container */}
          <div 
            ref={mapContainer} 
            className="h-[calc(100vh-8rem)]"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;