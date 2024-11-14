const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// URL validation helper function
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

router.post('/api/route', async (req, res) => {
  try {
    const { type, properties, geometry } = req.body;

    // Validate the basic structure
    if (!type || !properties || !geometry || !geometry.coordinates) {
      console.error('Missing required fields in the request body:', req.body);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate URL if provided
    if (properties.url && !isValidUrl(properties.url)) {
      console.error('Invalid URL format in the request body:', req.body);
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // Ensure all coordinate values are numbers
    const cleanedCoordinates = geometry.coordinates.map(coord => {
      if (coord.length !== 3) {
        throw new Error('Each coordinate must have longitude, latitude, and elevation');
      }
      return [
        Number(coord[0]), // longitude
        Number(coord[1]), // latitude
        Number(coord[2])  // elevation
      ];
    });

    // Create the route document
    const newRoute = new Route({
      type,
      properties: {
        name: properties.name,
        description: properties.description || 'No description',
        fileName: properties.fileName,
        url: properties.url || '', // Add URL field with empty string as default
        roadType: properties.roadType,
        difficulty: properties.difficulty,
        time: new Date(properties.time),
        stats: {
          totalDistance: Number(properties.stats.totalDistance),
          maxElevation: Number(properties.stats.maxElevation),
          minElevation: Number(properties.stats.minElevation),
          elevationGain: Number(properties.stats.elevationGain),
          numberOfPoints: Number(properties.stats.numberOfPoints)
        }
      },
      geometry: {
        type: 'LineString',
        coordinates: cleanedCoordinates
      }
    });

    // Save the route
    const savedRoute = await newRoute.save();
    console.log('New route saved:', savedRoute);

    res.status(201).json({
      success: true,
      data: savedRoute,
      message: 'Route saved successfully'
    });

  } catch (error) {
    console.error('Error saving route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save route'
    });
  }
});

// GET route to fetch a route by URL
router.get('/api/route', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    const route = await Route.findOne({ 'properties.url': url });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error('Error fetching route by URL:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch route'
    });
  }
});

module.exports = router;