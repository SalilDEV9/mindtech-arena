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

// POST /api/leaderboard/scores - Password-protected bulk score update
app.post('/api/leaderboard/scores', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection not available.',
    });
  }

  const { password, updates } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'testingPass';

  if (!password || password !== adminPassword) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect admin password.',
    });
  }

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No updates provided.',
    });
  }

  // Validate updates
  const bulkOps = [];
  for (const item of updates) {
    const pts = Number(item.points);
    if (!item.teamId || isNaN(pts) || pts < 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid score for team ${item.teamId || 'unknown'}. Points must be a non-negative number.`,
      });
    }

    bulkOps.push({
      updateOne: {
        filter: { teamId: item.teamId },
        update: {
          $set: {
            points: Math.round(pts),
            updatedAt: new Date(),
          },
        },
      },
    });
  }

  try {
    const result = await Team.bulkWrite(bulkOps);
    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount || updates.length} team score(s).`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error updating team scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update scores in database.',
    });
  }
});

// POST /api/leaderboard/teams - Password-protected new team creation
app.post('/api/leaderboard/teams', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection not available.',
    });
  }

  const { password, teamName, teamLeader, teamId, points } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'testingPass';

  if (!password || password !== adminPassword) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect admin password.',
    });
  }

  const trimmedName = (teamName || '').trim();
  const trimmedLeader = (teamLeader || '').trim();
  const trimmedId = (teamId || '').trim().toUpperCase();
  const parsedPoints = Number(points !== undefined && points !== null && points !== '' ? points : 0);

  if (!trimmedName || !trimmedLeader || !trimmedId) {
    return res.status(400).json({
      success: false,
      error: 'Team Name, Team Leader, and Team ID are all required.',
    });
  }

  if (isNaN(parsedPoints) || parsedPoints < 0) {
    return res.status(400).json({
      success: false,
      error: 'Score must be a non-negative number.',
    });
  }

  try {
    const existing = await Team.findOne({ teamId: trimmedId });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A team with ID "${trimmedId}" already exists (${existing.teamName}).`,
      });
    }

    const newTeam = await Team.create({
      teamName: trimmedName,
      teamLeader: trimmedLeader,
      teamId: trimmedId,
      points: Math.round(parsedPoints),
    });

    res.status(201).json({
      success: true,
      message: `Team "${newTeam.teamName}" added successfully.`,
      data: newTeam,
    });
  } catch (error) {
    console.error('Error adding team:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add team to database.',
    });
  }
});

// DELETE & POST /api/leaderboard/teams/delete - Password-protected bulk team deletion
async function handleBulkDelete(req, res) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection not available.',
    });
  }

  const { password, teamIds } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'testingPass';

  if (!password || password !== adminPassword) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect admin password.',
    });
  }

  if (!Array.isArray(teamIds) || teamIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No team IDs provided for deletion.',
    });
  }

  const sanitizedIds = teamIds.map((id) => String(id).trim().toUpperCase()).filter(Boolean);

  try {
    const result = await Team.deleteMany({ teamId: { $in: sanitizedIds } });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} team(s).`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting teams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete teams from database.',
    });
  }
}

app.delete('/api/leaderboard/teams', handleBulkDelete);
app.post('/api/leaderboard/teams/delete', handleBulkDelete);

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
