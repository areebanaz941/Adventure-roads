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
    <div className="fixed top-20 right-4 z-50 w-96 transform transition-all duration-500 ease-in-out">
      <div className={`shadow-2xl rounded-lg overflow-hidden ${
        status.type === 'success' ? 'bg-white border-l-4 border-green-500' : 'bg-white border-l-4 border-red-500'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          status.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center">
            {status.type === 'success' ? (
              <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            )}
            <span className="font-semibold text-lg">
              {status.type === 'success' ? 'Success!' : 'Error'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Message */}
        <div className="px-6 py-4 bg-white">
          <p className="text-gray-700">{status.message}</p>
        </div>

        {/* Route Details - Only show on success */}
        {status.type === 'success' && status.route?.properties && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{status.route.properties.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium text-gray-900">{status.route.properties.stats?.totalDistance || 0} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Elevation Gain:</span>
                <span className="font-medium text-gray-900">{status.route.properties.stats?.elevationGain || 0} m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Points:</span>
                <span className="font-medium text-gray-900">{status.route.properties.stats?.numberOfPoints || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="h-1 w-full bg-gray-100">
          <div 
            className={`h-full transition-all duration-300 ${
              status.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              animation: 'shrink 5s linear forwards'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SaveNotification;