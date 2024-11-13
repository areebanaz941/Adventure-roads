import React from 'react';
import { useMapContext } from '../MapContext';
import * as turf from '@turf/turf';

export const SplitLineToChunksButton = () => {
  const { draw, selectedFeature } = useMapContext();

  const splitLineToChunks = () => {
    if (!selectedFeature) {
      alert('Please select a line first');
      return;
    }

    try {
      const chunkLength = prompt('Enter chunk length in kilometers:', '2');
      if (!chunkLength) return;

      const chunks = turf.lineChunk(selectedFeature, parseFloat(chunkLength), {units: 'kilometers'});
      
      // Preserve original properties for each chunk
      chunks.features = chunks.features.map((chunk, index) => ({
        ...chunk,
        properties: {
          ...selectedFeature.properties,
          name: `${selectedFeature.properties.name || 'Route'} - Part ${index + 1}`
        }
      }));
      
      draw.current.delete(selectedFeature.id);
      chunks.features.forEach(chunk => {
        draw.current.add(chunk);
      });
    } catch (error) {
      console.error('Error splitting line:', error);
      alert('Error splitting line into chunks');
    }
  };

  return (
    <button
      onClick={splitLineToChunks}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm"
      disabled={!selectedFeature}
    >
      Split Selected Line to Chunks
    </button>
  );
};

export const SplitLineAtPointButton = () => {
  const { map, draw, selectedFeature } = useMapContext();

  const splitLineAtPoint = () => {
    if (!selectedFeature) {
      alert('Please select a line first');
      return;
    }

    const clickHandler = (e) => {
      const point = turf.point([e.lngLat.lng, e.lngLat.lat]);
      const line = selectedFeature;
      
      try {
        const nearestPoint = turf.nearestPointOnLine(line, point);
        const splitted = turf.lineSplit(line, nearestPoint);
        
        // Preserve original properties for split parts
        splitted.features = splitted.features.map((part, index) => ({
          ...part,
          properties: {
            ...line.properties,
            name: `${line.properties.name || 'Route'} - Part ${index + 1}`
          }
        }));

        draw.current.delete(line.id);
        splitted.features.forEach(part => {
          draw.current.add(part);
        });
        
        map.current.off('click', clickHandler);
        alert('Line split successfully!');
      } catch (error) {
        console.error('Error splitting line:', error);
        alert('Error splitting line at point');
        map.current.off('click', clickHandler);
      }
    };

    map.current.on('click', clickHandler);
    alert('Click on the map where you want to split the line');
  };

  return (
    <button
      onClick={splitLineAtPoint}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm"
      disabled={!selectedFeature}
    >
      Split Selected Line at Clicked Point
    </button>
  );
};