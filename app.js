// app.js
const express = require('express');
const mongoose = require('mongoose');
const speciesRoutes = require('./routes/speciesRoutes');
const connectDB = require('./DataBase/DB'); // Import the database connection
const app = express();

// Connect to MongoDB
connectDB();

app.use('/api/species', speciesRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
