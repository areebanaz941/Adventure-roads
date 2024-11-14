// server/routes/api/routes.js

const express = require('express');
const router = express.Router();
const Route = require('../../models/Route');

/**
 * @route   POST api/routes
 * @desc    Create a new route
 * @access  Public (for now)
 */
router.post('/', async (req, res) => {
  try {
    const { properties, geometry, type } = req.body;

    const newRoute = new Route({
      type,
      properties,
      geometry
    });

    const savedRoute = await newRoute.save();

    res.status(201).json({
      success: true,
      data: savedRoute,
      message: 'Route saved successfully'
    });

  } catch (error) {
    console.error('Error saving route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error saving route'
    });
  }
});

/**
 * @route   GET api/routes
 * @desc    Get all routes
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find().sort({ 'properties.time': -1 });
    
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });

  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching routes'
    });
  }
});

/**
 * @route   GET api/routes/:id
 * @desc    Get single route by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching route'
    });
  }
});

/**
 * @route   PUT api/routes/:id
 * @desc    Update route
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      data: route,
      message: 'Route updated successfully'
    });

  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating route'
    });
  }
});

/**
 * @route   DELETE api/routes/:id
 * @desc    Delete route
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting route'
    });
  }
});

module.exports = router;