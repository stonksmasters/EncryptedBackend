const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
require('dotenv').config();

const app = express();

// Update CORS settings to allow only the frontend hosted on Netlify
app.use(cors({
  origin: 'https://encryptedmessaging.netlify.app', // Replace with your Netlify frontend URL
  methods: ['GET', 'POST'],
  credentials: true, // Allow cookies or other credentials to be sent if needed
}));

app.use(bodyParser.json());

// Import routes
const apiRoutes = require('./routes/api');

// Use API routes
app.use('/api', apiRoutes);

// Simple route to check server status
app.get('/', (req, res) => {
  res.send('Encrypted Messaging API is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
