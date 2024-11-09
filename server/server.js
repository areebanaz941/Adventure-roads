// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import routes - use consistent casing 'adminRoutes'
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/temp');  // Changed from AdminRoutes to adminRoutes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Routes - use the same casing as in the import
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);  // Changed to match import variable name

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Adventure Roads API' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

// server/server.js
const PORT = process.env.PORT || 5000;  // Changed from 3001 to 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});