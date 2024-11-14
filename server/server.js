// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const routes = require('./routes/routes'); 
 // Changed from Route to routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/temp');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit if cannot connect to database
});

// MongoDB connection error handling
mongoose.connection.on('error', err => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Routes
app.use('/api/routes', routes); // Register the routes middleware
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Welcome route
app.get('/api/route', (req, res) => {
    res.json({ 
        message: 'Welcome to Adventure Roads API',
        status: 'active',
        version: '1.0.0'
    });
});

app.post('/api/route', (req, res) => {
    const data = req.body; // Access the data sent in the request body
    res.json({ 
        success: true, 
        message: 'Data received successfully', 
        data: data 
    });
});

// 404 handler - Keep this after all valid routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware - Keep this last
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err);
    process.exit(1);
});