// src/components/Map/RouteInfo.js
import React from 'react';

const RouteInfo = ({ route, className }) => {
  if (!route) return null;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{route.name}</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Distance</h3>
          <p className="mt-1 text-lg text-gray-900">{route.distance} km</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Surface Type</h3>
          <p className="mt-1 text-lg text-gray-900">{route.surfaceType}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Elevation Gain</h3>
          <p className="mt-1 text-lg text-gray-900">{route.elevationGain} m</p>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500">Recent Comments</h3>
          <div className="mt-2 space-y-3 max-h-40 overflow-y-auto">
            {route.comments?.map((comment, index) => (
              <div key={index} className="border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-600">{comment.text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {comment.author} - {new Date(comment.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Download GPX
        </button>
      </div>
    </div>
  );
};

export default RouteInfo;