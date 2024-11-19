import React, { useEffect, useRef, useState } from 'react';
import ElevationChart from './ElevationChart';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const Notification = ({ message, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
      {message}
    </div>
  );
};

const LeftSidebar = ({ routes, selectedRoute, setSelectedRoute, setRoutes }) => {
  const [changes, setChanges] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const roadTypes = [
    'Tar/Sealed Road',
    'Gravel Road',
    'Dirt Track',
    'Off Road',
    'Mixed Surface'
  ];

  const difficultyLevels = [
    'Unknown',
    'Easy',
    'Moderate',
    'Difficult',
    'Very Difficult',
    'Extreme'
  ];

  useEffect(() => {
    setChanges({});
  }, [selectedRoute]);

  const handleInputChange = (field, value) => {
    if (selectedRoute) {
      const currentValue = selectedRoute.properties[field] || '';
      const newValue = value || '';

      setSelectedRoute({
        ...selectedRoute,
        properties: {
          ...selectedRoute.properties,
          [field]: newValue
        }
      });

      if (currentValue !== newValue) {
        setChanges(prev => ({
          ...prev,
          [field]: {
            fieldName: field,
            from: currentValue || '(empty)',
            to: newValue || '(empty)'
          }
        }));
      } else {
        const newChanges = { ...changes };
        delete newChanges[field];
        setChanges(newChanges);
      }
    }
  };

  const handleApply = () => {
    if (Object.keys(changes).length > 0) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    setRoutes(routes.map(r => r.id === selectedRoute.id ? selectedRoute : r));
    setIsSuccess(true);
    setChanges({});
    setShowConfirmation(false);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleCancel = () => {
    const originalRoute = routes.find(r => r.id === selectedRoute.id);
    if (originalRoute) {
      setSelectedRoute(originalRoute);
    }
    setChanges({});
    setShowConfirmation(false);
  };

  return (
    <div className="w-96 bg-[#d2d2d3] border-r border-gray-200 flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-[#4B8BF4] text-white p-2 flex justify-between items-center shrink-0">
        <h3 className="font-bold">Route Info</h3>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {selectedRoute ? (
          <div className="space-y-4">
            {/* Route Name */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name:
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedRoute.properties.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            {/* Road Type and Difficulty */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Road Type:
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={selectedRoute.properties.roadType || 'Tar/Sealed Road'}
                    onChange={(e) => handleInputChange('roadType', e.target.value)}
                  >
                    {roadTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty:
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={selectedRoute.properties.difficulty || 'Unknown'}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  >
                    {difficultyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Basic Stats Grid */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-blue-600">Distance</div>
                  <div className="text-lg font-bold">{selectedRoute.properties.stats.totalDistance} km</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-blue-600">Elevation Gain</div>
                  <div className="text-lg font-bold">{selectedRoute.properties.stats.elevationGain} m</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-blue-600">Max Elevation</div>
                  <div className="text-lg font-bold">{selectedRoute.properties.stats.maxElevation} m</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-blue-600">Min Elevation</div>
                  <div className="text-lg font-bold">{selectedRoute.properties.stats.minElevation} m</div>
                </div>
              </div>
            </div>

            {/* Route Details */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-bold mb-2">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-medium">{selectedRoute.properties.stats.numberOfPoints}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">Created Date</span>
                  <span className="font-medium">
                    {new Date(selectedRoute.properties.time).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">Avg Elevation</span>
                  <span className="font-medium">
                    {((parseFloat(selectedRoute.properties.stats.maxElevation) +
                      parseFloat(selectedRoute.properties.stats.minElevation)) / 2).toFixed(0)} m
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-bold mb-2">Description</h4>
              <textarea 
                className="w-full p-2 border rounded-md text-sm"
                rows="3"
                placeholder="Add comments here..."
                value={selectedRoute.properties.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* Elevation Profile */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-bold mb-3">Elevation Profile</h4>
              <div className="bg-white rounded">
                <ElevationChart data={selectedRoute.geometry.coordinates} />
              </div>
            </div>

        
          </div>
        ) : (
          <p className="text-gray-900">Select a route to view details.</p>
        )}
      </div>

      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-xl font-bold">Route Changes Summary</h2>
            <p className="text-sm text-gray-600 mt-1">
              The following changes will be applied to route: 
              <span className="font-medium ml-1">{selectedRoute?.properties?.name}</span>
            </p>
          </div>
          <div className="space-y-2">
            {Object.entries(changes).map(([field, { fieldName, from, to }]) => (
              <div key={field} className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-800 mb-1">{fieldName}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">From: </span>
                    <span className="text-gray-700">{from}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">To: </span>
                    <span className="text-blue-600">{to}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Confirm Changes
            </button>
          </div>
        </div>
      </Modal>

      <Notification
        message={`Changes to ${selectedRoute?.properties?.name} saved successfully!`}
        isVisible={isSuccess}
      />
    </div>
  );
};

export default LeftSidebar;