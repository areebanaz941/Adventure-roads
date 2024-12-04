// server/middleware/validateRoute.js
const validateRoute = (req, res, next) => {
    const { type, properties, geometry } = req.body;
  
    // Log the incoming request
    console.log('Validating route data:', JSON.stringify(req.body, null, 2));
  
    if (!type || !properties || !geometry) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, properties, or geometry'
      });
    }
  
    if (!properties.name) {
      return res.status(400).json({
        success: false,
        message: 'Route name is required'
      });
    }
  
    if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates format'
      });
    }
  
    // Convert string numbers to actual numbers
    if (properties.stats) {
      properties.stats = {
        totalDistance: Number(properties.stats.totalDistance),
        maxElevation: Number(properties.stats.maxElevation),
        minElevation: Number(properties.stats.minElevation),
        elevationGain: Number(properties.stats.elevationGain),
        numberOfPoints: Number(properties.stats.numberOfPoints)
      };
    }
  
    // Convert coordinates to numbers
    geometry.coordinates = geometry.coordinates.map(coord => 
      coord.map(val => typeof val === 'string' ? Number(val) : val)
    );
  
    next();
  };
  
  module.exports = validateRoute;