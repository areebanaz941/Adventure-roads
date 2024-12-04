// server/utils/gpxProcessor.js
const fs = require('fs');
const togeojson = require('@mapbox/togeojson');
const DOMParser = require('xmldom').DOMParser;

const processGPXFile = (gpxFile) => {
    try {
        const gpxContent = fs.readFileSync(gpxFile, 'utf8');
        const gpxDOM = new DOMParser().parseFromString(gpxContent, 'text/xml');
        const geoJSON = togeojson.gpx(gpxDOM);
        return geoJSON;
    } catch (error) {
        throw new Error(`Error processing GPX file: ${error.message}`);
    }
};

const extractRouteInfo = (geoJSON) => {
    try {
        let distance = 0;
        let elevationPoints = [];
        const coordinates = geoJSON.features[0].geometry.coordinates;

        for (let i = 0; i < coordinates.length - 1; i++) {
            const [lon1, lat1, ele1] = coordinates[i];
            const [lon2, lat2, ele2] = coordinates[i + 1];
            
            // Calculate distance between points
            distance += calculateDistance(lat1, lon1, lat2, lon2);
            
            // Store elevation data
            if (ele1) {
                elevationPoints.push([distance, ele1]);
            }
        }

        return {
            distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
            elevationProfile: elevationPoints
        };
    } catch (error) {
        throw new Error(`Error extracting route info: ${error.message}`);
    }
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const toRad = (degrees) => {
    return degrees * Math.PI / 180;
};

module.exports = {
    processGPXFile,
    extractRouteInfo
};