import React from 'react';
import { useMapContext } from '../MapContext';
import mapboxgl from 'mapbox-gl';

const CalculateRouteButton = () => {
  const { draw, selectedFeatures } = useMapContext(); // Removed unused 'map'

  const calculateRouteBetween = async () => {
    if (selectedFeatures.length !== 2) {
      alert('Please select exactly two lines');
      return;
    }

    try {
      const [start, end] = selectedFeatures;
      const startCoord = start.geometry.coordinates[0];
      const endCoord = end.geometry.coordinates[0];

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to calculate route');
      }

      const data = await response.json();
      const route = data.routes[0];

      draw.current.add({
        type: 'Feature',
        properties: {
          name: 'Calculated Route',
          road_type: 'not_defined',
          difficulty: 'unknown',
          description: 'Automatically calculated route'
        },
        geometry: route.geometry
      });
    } catch (error) {
      console.error('Error calculating route:', error);
      alert('Error calculating route between points');
    }
  };

  return (
    <button
      onClick={calculateRouteBetween}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm"
    >
      Calculate Route Between
    </button>
  );
};

export default CalculateRouteButton;