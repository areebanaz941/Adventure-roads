const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Mongoose Schema
const routeSchema = new mongoose.Schema({
  name: String,
  description: String,
  fileName: String,
  roadType: String,
  path: [[Number]],
  stats: {
    totalDistance: Number,
    maxElevation: Number,
    minElevation: Number,
    elevationGain: Number,
    numberOfPoints: Number
  }
}, { 
  collection: 'routes',
  timestamps: true
});

const Route = mongoose.model('Route', routeSchema);

// Import routes
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const tempRoutes = require('./routes/temp');

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  next();
});

// Route Middlewares - Register all routes BEFORE error handlers
app.use('/api', tempRoutes);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentRoutes);

// Mount the routes - this is crucial
app.use('/api/user', userRoutes);  // This line is important

// Routes
app.post('/api/routes', async (req, res) => {
  try {
    console.log('Received route data:', req.body);

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
    console.log('Saved route:', savedRoute);
    
    const formattedRoute = {
      type: 'Feature',
      properties: {
        name: savedRoute.name,
        description: savedRoute.description,
        roadType: savedRoute.roadType,
        fileName: savedRoute.fileName,
        stats: savedRoute.stats
      },
      geometry: {
        type: 'LineString',
        coordinates: savedRoute.path
      },
      _id: savedRoute._id
    };

    res.status(201).json({ 
      success: true, 
      data: formattedRoute,
      message: 'Route saved successfully'
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to save route: ${error.message}` 
    });
  }
});

app.get('/api/routes', async (req, res) => {
  try {
    console.log('Fetching routes...');
    const routes = await Route.find({}).sort('-createdAt');
    console.log(`Found ${routes.length} routes`);
    
    const formattedRoutes = routes.map(route => ({
      type: 'Feature',
      properties: {
        name: route.name,
        description: route.description,
        roadType: route.roadType,
        fileName: route.fileName,
        stats: route.stats
      },
      geometry: {
        type: 'LineString',
        coordinates: route.path
      },
      _id: route._id
    }));

    res.json({ 
      success: true, 
      data: formattedRoutes,
      count: formattedRoutes.length
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to fetch routes: ${error.message}` 
    });
  }
});

// Error Handlers - AFTER all routes
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// MongoDB connection error handling
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});