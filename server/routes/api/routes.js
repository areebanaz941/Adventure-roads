// routes/api/routeRoutes.js
const express = require('express');
const router = express.Router();
const Route = require('../../models/Route');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
router.post('/', async (req, res) => {
  try {
    const newRoute = new Route({
      name: req.body.name || req.body.properties?.name,
      description: req.body.description || req.body.properties?.description,
      fileName: req.body.fileName || req.body.properties?.fileName,
      roadType: req.body.roadType || req.body.properties?.roadType,
      path: req.body.geometry?.coordinates || req.body.path,
      stats: {
        totalDistance: Number(req.body.stats?.totalDistance || req.body.properties?.stats?.totalDistance),
        maxElevation: Number(req.body.stats?.maxElevation || req.body.properties?.stats?.maxElevation),
        minElevation: Number(req.body.stats?.minElevation || req.body.properties?.stats?.minElevation),
        elevationGain: Number(req.body.stats?.elevationGain || req.body.properties?.stats?.elevationGain),
        numberOfPoints: Number(req.body.stats?.numberOfPoints || req.body.properties?.stats?.numberOfPoints)
      }
    });

    const savedRoute = await newRoute.save();
    res.status(201).json({ 
      success: true, 
      data: {
        ...savedRoute.toObject(),
        properties: {
          name: savedRoute.name,
          description: savedRoute.description,
          roadType: savedRoute.roadType,
          stats: savedRoute.stats
        }
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/api/routes', async (req, res) => {
  try {
    console.log('Fetching routes from database...');
    const routes = await Route.find({}).sort('-createdAt');
    console.log(`Found ${routes.length} routes in database`);
    
    res.json({
      success: true,
      data: routes,
      count: routes.length
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});





module.exports = router;