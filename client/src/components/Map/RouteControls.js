// src/components/Map/RouteControls.js
import React from 'react';

const RouteControls = ({ onSplitRoute, selectedRoute }) => {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Controls</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => onSplitRoute()}
          disabled={!selectedRoute}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Split at Point
        </button>

        <button
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default RouteControls;