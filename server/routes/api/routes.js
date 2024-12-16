// routes/api/routeRoutes.js
const express = require('express');
const router = express.Router();
const Route = require('../../models/Route');

router.post('/api/routes', async (req, res) => {
  try {
    // Extract path coordinates
    const pathCoordinates = req.body.geometry?.coordinates || req.body.path;

    // Check if a route with the same path already exists
    const existingRoute = await Route.findOne({
      path: {
        $deepEquals: pathCoordinates
      }
    });

    if (existingRoute) {
      // If route exists, update the existing route
      existingRoute.name = req.body.name || req.body.properties?.name || existingRoute.name;
      existingRoute.description = req.body.description || req.body.properties?.description || existingRoute.description;
      existingRoute.fileName = req.body.fileName || req.body.properties?.fileName || existingRoute.fileName;
      existingRoute.roadType = req.body.roadType || req.body.properties?.roadType || existingRoute.roadType;
      
      // Update stats
      existingRoute.stats = {
        totalDistance: Number(req.body.stats?.totalDistance || req.body.properties?.stats?.totalDistance || existingRoute.stats.totalDistance),
        maxElevation: Number(req.body.stats?.maxElevation || req.body.properties?.stats?.maxElevation || existingRoute.stats.maxElevation),
        minElevation: Number(req.body.stats?.minElevation || req.body.properties?.stats?.minElevation || existingRoute.stats.minElevation),
        elevationGain: Number(req.body.stats?.elevationGain || req.body.properties?.stats?.elevationGain || existingRoute.stats.elevationGain),
        numberOfPoints: Number(req.body.stats?.numberOfPoints || req.body.properties?.stats?.numberOfPoints || existingRoute.stats.numberOfPoints)
      };

      // Save the updated route
      const updatedRoute = await existingRoute.save();
      
      return res.status(200).json({ 
        success: true, 
        data: {
          ...updatedRoute.toObject(),
          properties: {
            name: updatedRoute.name,
            description: updatedRoute.description,
            roadType: updatedRoute.roadType,
            stats: updatedRoute.stats
          }
        },
        message: "Existing route updated successfully"
      });
    }

    // If no existing route, create a new route
    const newRoute = new Route({
      name: req.body.name || req.body.properties?.name,
      description: req.body.description || req.body.properties?.description,
      fileName: req.body.fileName || req.body.properties?.fileName,
      roadType: req.body.roadType || req.body.properties?.roadType,
      path: pathCoordinates,
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
      },
      message: "New route created successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});