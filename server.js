require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Team = require('./models/Team');

const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindtech_arena';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// MongoDB Connection
let isDbConnected = false;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    isDbConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
  })
  .catch((err) => {
    isDbConnected = false;
    console.error('❌ MongoDB Connection Error:', err.message);
  });

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('connected', () => {
  isDbConnected = true;
  console.log('✅ MongoDB connected.');
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/leaderboard?page=1&limit=15
app.get('/api/leaderboard', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection not available. Please check MongoDB configuration.',
      data: null,
    });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const [totalTeams, teams] = await Promise.all([
      Team.countDocuments(),
      Team.find()
        .sort({ points: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .select('teamName teamLeader teamId points updatedAt')
        .lean(),
    ]);

    const totalPages = Math.ceil(totalTeams / limit) || 1;

    // Attach overall rank based on sort position
    const rankedTeams = teams.map((team, index) => ({
      ...team,
      rank: skip + index + 1,
    }));

    res.json({
      success: true,
      data: {
        teams: rankedTeams,
        pagination: {
          totalTeams,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve leaderboard data.',
      data: null,
    });
  }
});

// Route for Leaderboard page
app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'leaderboard.html'));
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 MindTech Arena server running on http://localhost:${PORT}`);
});
