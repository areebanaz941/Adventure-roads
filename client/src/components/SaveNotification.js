// src/components/SaveNotification.js
import React, { useEffect } from 'react';

const SaveNotification = ({ status, onClose }) => {
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (!status) return null;

  return (
    <div className={`fixed bottom-4 right-4 w-96 transform transition-transform duration-500 ease-in-out translate-x-0`}>
      <div className={`rounded-lg shadow-lg overflow-hidden ${
        status.type === 'success' ? 'bg-white border-l-4 border-green-500' : 'bg-white border-l-4 border-red-500'
      }`}>
        {/* Header */}
        <div className={`px-4 py-2 flex justify-between items-center ${
          status.type === 'success' ? 'text-green-700' : 'text-red-700'
        }`}>
          <div className="flex items-center">
            {status.type === 'success' ? (
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-semibold">
              {status.type === 'success' ? 'Success' : 'Error'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message */}
        <div className="px-4 py-3 bg-white">
          <p className="text-gray-700">{status.message}</p>
        </div>

        {/* Route Details */}
        {status.type === 'success' && status.route && (
          <div className="px-4 py-3 bg-gray-50 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Route Details:</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Name:</span>
                <span className="text-gray-800 font-medium">{status.route.properties.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Distance:</span>
                <span className="text-gray-800 font-medium">{status.route.properties.stats.totalDistance} km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Points:</span>
                <span className="text-gray-800 font-medium">{status.route.properties.stats.numberOfPoints}</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200">
          <div className={`h-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'} w-full animate-shrink`} />
        </div>
      </div>
    </div>
  );
};

export default SaveNotification;