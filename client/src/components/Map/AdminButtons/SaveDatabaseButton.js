import React from 'react';
import { useMapContext } from '../MapContext';

const SaveDatabaseButton = () => {
  const { draw } = useMapContext();

  const saveToDatabase = async () => {
    try {
      const features = draw.current.getAll();
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(features),
      });

      if (!response.ok) {
        throw new Error('Failed to save routes');
      }

      alert('Routes saved successfully!');
    } catch (error) {
      console.error('Error saving to database:', error);
      alert('Failed to save routes to database');
    }
  };

  return (
    <button
      onClick={saveToDatabase}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm"
    >
      SAVE IN DATABASE
    </button>
  );
};

export default SaveDatabaseButton;