// server/utils/geoJsonConverter.js
const turf = require('@turf/turf');

const convertToGeoJson = (routeData) => {
    try {
        // Ensure the input is in GeoJSON format
        if (!routeData.type || !routeData.features) {
            throw new Error('Invalid route data format');
        }

        // Add additional properties if needed
        const enrichedGeoJson = {
            ...routeData,
            features: routeData.features.map(feature => ({
                ...feature,
                properties: {
                    ...feature.properties,
                    surfaceType: feature.properties.surfaceType || 'unknown',
                    timestamp: new Date().toISOString()
                }
            }))
        };

        return enrichedGeoJson;
    } catch (error) {
        throw new Error(`Error converting to GeoJSON: ${error.message}`);
    }
};

const splitRouteAtPoint = (route, point) => {
    try {
        const line = route.features[0].geometry;
        const clickPoint = turf.point(point);
        const snappedPoint = turf.nearestPointOnLine(line, clickPoint);
        
        // Split the line at the nearest point
        const segments = turf.lineSplit(line, snappedPoint);
        
        return {
            type: 'FeatureCollection',
            features: segments.features.map(segment => ({
                ...segment,
                properties: route.features[0].properties
            }))
        };
    } catch (error) {
        throw new Error(`Error splitting route: ${error.message}`);
    }
};

const mergeRoutes = (routes) => {
    try {
        const merged = turf.combine(turf.featureCollection(
            routes.map(route => route.features[0])
        ));

        return {
            type: 'FeatureCollection',
            features: [
                {
                    ...merged.features[0],
                    properties: {
                        name: 'Merged Route',
                        timestamp: new Date().toISOString()
                    }
                }
            ]
        };
    } catch (error) {
        throw new Error(`Error merging routes: ${error.message}`);
    }
};

module.exports = {
    convertToGeoJson,
    splitRouteAtPoint,
    mergeRoutes
};