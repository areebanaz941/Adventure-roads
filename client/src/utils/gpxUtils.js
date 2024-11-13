// src/utils/gpxUtils.js
import { DOMParser } from 'xmldom';
import toGeoJSON from '@mapbox/togeojson';

export const processGPXFile = (gpxFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const parser = new DOMParser();
        const gpxData = parser.parseFromString(e.target.result, 'text/xml');
        const geoJSON = toGeoJSON.gpx(gpxData);
        resolve(geoJSON);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(gpxFile);
  });
};