// frontend/src/components/Map/SaveDatabaseButton.js
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SaveDatabaseButton = ({ selectedRoute }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSaveToDatabase = async () => {
    if (!selectedRoute) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth header here if using authentication
        },
        body: JSON.stringify({
          type: 'Feature',
          properties: {
            name: selectedRoute.properties.name,
            description: selectedRoute.properties.description,
            roadType: selectedRoute.properties.roadType,
            difficulty: selectedRoute.properties.difficulty,
            stats: {
              totalDistance: parseFloat(selectedRoute.properties.stats.totalDistance),
              maxElevation: parseFloat(selectedRoute.properties.stats.maxElevation),
              minElevation: parseFloat(selectedRoute.properties.stats.minElevation),
              elevationGain: parseFloat(selectedRoute.properties.stats.elevationGain),
              numberOfPoints: parseInt(selectedRoute.properties.stats.numberOfPoints)
            },
            time: selectedRoute.properties.time,
            fileName: selectedRoute.properties.fileName
          },
          geometry: selectedRoute.geometry
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save route');
      }

      const savedRoute = await response.json();
      setSaveStatus({
        type: 'success',
        message: `Route "${savedRoute.properties.name}" saved successfully!`
      });
    } catch (error) {
      console.error('Error saving route:', error);
      setSaveStatus({
        type: 'error',
        message: 'Failed to save route to database'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleSaveToDatabase}
        disabled={isSaving || !selectedRoute}
        className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm flex items-center ${
          (isSaving || !selectedRoute) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSaving ? 'Saving...' : 'SAVE IN DATABASE'}
      </button>

      {saveStatus && (
        <Alert 
          className={`absolute top-full mt-2 w-64 ${
            saveStatus.type === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <AlertDescription>
            {saveStatus.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SaveDatabaseButton;