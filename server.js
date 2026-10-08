require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const crypto = require('node:crypto');
const Team = require('./models/Team');

const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || (process.env.VERCEL ? null : 'mongodb://127.0.0.1:27017/mindtech_arena');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: '2kb' }));

// Signed, expiring session: password stays on the server and is never stored in browser storage.
const SESSION_COOKIE = 'arena_admin';
const SESSION_SECONDS = 8 * 60 * 60;
function signature(value) {
  return crypto.createHmac('sha256', process.env.ADMIN_PASSWORD).update(value).digest('hex');
}
function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = crypto.createHash('sha256').update(a).digest();
  const right = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(left, right);
}
function authenticated(req) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const cookie = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(SESSION_COOKIE + '='));
  if (!cookie) return false;
  const token = cookie.slice(SESSION_COOKIE.length + 1);
  const parts = token.split('.');
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{32}$/.test(parts[1])) return false;
  const expires = Number(parts[0]);
  const now = Math.floor(Date.now() / 1000);
  return expires > now && expires <= now + SESSION_SECONDS && equal(parts[2], signature(parts[0] + '.' + parts[1]));
}
function requireAdmin(req, res, next) {
  res.set('Cache-Control', 'private, no-store');
  if (!authenticated(req)) {
    if (req.originalUrl.startsWith('/api/')) return res.status(401).json({success: false, error: 'Enter the admin password to open the leaderboard.'});
    return res.redirect('/leaderboard/login');
  }
  next();
}
const cookieOptions = {httpOnly: true, secure: Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production'), sameSite: 'strict', path: '/'};
app.get('/leaderboard/login', (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  if (authenticated(req)) return res.redirect('/leaderboard');
  res.sendFile(path.join(__dirname, 'dist', 'leaderboard-login.html'));
});
app.post('/leaderboard/login', (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  if (!process.env.ADMIN_PASSWORD) return res.status(503).send('Admin access is not configured. Contact the organisers.');
  if (!equal(req.body.password, process.env.ADMIN_PASSWORD)) return res.redirect(303, '/leaderboard/login?error=1');
  const payload = Math.floor(Date.now() / 1000) + SESSION_SECONDS + '.' + crypto.randomBytes(16).toString('hex');
  res.cookie(SESSION_COOKIE, payload + '.' + signature(payload), {...cookieOptions, maxAge: SESSION_SECONDS * 1000});
  res.redirect(303, '/leaderboard');
});
app.post('/leaderboard/logout', (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.clearCookie(SESSION_COOKIE, cookieOptions);
  res.redirect(303, '/leaderboard/login');
});
// Run before static middleware, including direct HTML paths.
app.get(['/leaderboard', '/leaderboard.html'], requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'leaderboard.html'));
});
app.use('/api/leaderboard', requireAdmin);
app.use(express.static(path.join(__dirname, 'dist')));

// Reuse one connection and await it before database-backed requests.
let connectionPromise;
async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
    }).catch(error => {
      connectionPromise = null;
      throw error;
    });
  }
  await connectionPromise;
}

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use('/api/leaderboard', async (req, res, next) => {
  if (req.method !== 'GET' && !process.env.ADMIN_PASSWORD) {
    return res.status(503).json({success: false, error: 'Admin access is not configured.'});
  }
  try {
    await connectDatabase();
    next();
  } catch {
    res.status(503).json({success: false, error: 'Leaderboard database is unavailable. Contact the organisers.'});
  }
});

// API Routes
app.get('/api/health', async (req, res) => {
  try { await connectDatabase(); } catch { /* Health exposes configuration status without credentials. */ }
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    configured: { database: Boolean(MONGODB_URI), admin: Boolean(process.env.ADMIN_PASSWORD) },
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
  const adminPassword = process.env.ADMIN_PASSWORD;

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
  const adminPassword = process.env.ADMIN_PASSWORD;

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
  const adminPassword = process.env.ADMIN_PASSWORD;

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

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Vercel imports the app; local development starts the port listener.
module.exports = app;
if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`MindTech Arena server running on http://localhost:${PORT}`);
  });
}
