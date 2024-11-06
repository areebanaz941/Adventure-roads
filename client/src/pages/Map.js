// src/pages/Map.js
import React, { useState } from 'react';
import UserMap from '../components/Map/UserMap';
import RouteInfo from '../components/Map/RouteInfo';

const Map = () => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedRoutes, setSelectedRoutes] = useState([]);

  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        <UserMap 
          onRouteSelect={setSelectedRoute}
          onRoutesSelect={setSelectedRoutes}
        />
      </div>
      {selectedRoute && (
        <RouteInfo 
          route={selectedRoute}
          className="absolute right-4 top-4 w-96"
        />
      )}
      {selectedRoutes.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Download Selected Routes
          </button>
        </div>
      )}
    </div>
  );
};

export default Map;