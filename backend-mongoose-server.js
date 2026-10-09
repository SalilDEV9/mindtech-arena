/**
 * MINDMIND Cyber Arena - Real-Time Multi-Team Backend Server
 * Powered by Express, MongoDB/Mongoose, and Socket.io
 */

try {
  require('dotenv').config();
} catch (e) {}

const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');

let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  console.warn('[Server] Mongoose module not found locally. Running in memory mode.');
}

let socketIo;
try {
  socketIo = require('socket.io');
} catch (e) {
  console.warn('[Server] socket.io module not found locally. Running with HTTP real-time fallbacks.');
}

const app = express();
const server = http.createServer(app);

// Configuration
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// MONGOOSE SCHEMA & MODEL
// ==========================================
let Team = null;
let isMongoConnected = false;
const inMemoryTeams = new Map();

if (mongoose) {
  const teamSchema = new mongoose.Schema({
    teamId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    teamName: {
      type: String,
      trim: true,
      maxlength: 40
    },
    score: {
      type: Number,
      required: true,
      default: 0
    },
    currentRound: {
      type: Number,
      default: 1
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

  try {
    Team = mongoose.model('Team', teamSchema);
  } catch (e) {
    Team = mongoose.model('Team');
  }
}

// Connect to MongoDB
if (mongoose && MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      isMongoConnected = true;
      console.log('[MongoDB] Connected successfully to KarunyaDB Atlas.');
    })
    .catch((err) => {
      isMongoConnected = false;
      console.warn('[MongoDB] Connection warning:', err.message);
      console.log('[Server] In-memory persistence active as resilient fallback.');
    });

  mongoose.connection.on('connected', () => { isMongoConnected = true; });
  mongoose.connection.on('disconnected', () => { isMongoConnected = false; });
  mongoose.connection.on('error', (err) => { console.warn('[MongoDB] Error:', err.message); });
}

// ==========================================
// UNIFIED SCORE HELPER
// ==========================================
async function addPointsToTeam(rawTeamId, points) {
  const teamId = String(rawTeamId || '').trim().toUpperCase().replace(/[^\w\-_]/g, '').slice(0, 32);
  const pts = parseInt(points, 10) || 0;
  if (!teamId) return { teamId: 'UNKNOWN', score: 0 };

  if (isMongoConnected && Team) {
    try {
      const doc = await Team.findOneAndUpdate(
        { teamId },
        { 
          $inc: { score: pts },
          $set: { updatedAt: new Date() }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      inMemoryTeams.set(teamId, { teamId, score: doc.score, updatedAt: doc.updatedAt });
      console.log(`[Score] ${teamId} -> updated to ${doc.score} PTS (${pts >= 0 ? '+' : ''}${pts})`);
      return doc;
    } catch (err) {
      console.warn('[MongoDB] Point update failed, falling back to memory:', err.message);
    }
  }

  const existing = inMemoryTeams.get(teamId) || { teamId, score: 0, currentRound: 1, updatedAt: new Date() };
  existing.score += pts;
  existing.updatedAt = new Date();
  inMemoryTeams.set(teamId, existing);
  console.log(`[Memory] ${teamId} -> updated to ${existing.score} PTS (${pts >= 0 ? '+' : ''}${pts})`);
  return existing;
}

async function getOrCreateTeam(rawTeamId, rawTeamName) {
  const teamId = String(rawTeamId || '').trim().toUpperCase().replace(/[^\w\-_]/g, '').slice(0, 32);
  const teamName = typeof rawTeamName === 'string'
    ? rawTeamName.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 40)
    : '';
  if (!teamId) return null;

  if (isMongoConnected && Team) {
    try {
      let doc = await Team.findOne({ teamId }).lean();
      if (!doc) {
        doc = await Team.create({
          teamId,
          ...(teamName ? { teamName } : {}),
          score: 0,
          currentRound: 1,
          updatedAt: new Date()
        });
      } else if (teamName && !doc.teamName) {
        // Record a team name once, without overwriting existing identities or scores.
        doc = await Team.findOneAndUpdate(
          { teamId, $or: [{ teamName: { $exists: false } }, { teamName: '' }, { teamName: null }] },
          { $set: { teamName } },
          { new: true }
        ).lean() || doc;
      }
      inMemoryTeams.set(teamId, { teamId, teamName: doc.teamName || '', score: doc.score, currentRound: doc.currentRound, updatedAt: doc.updatedAt });
      return doc;
    } catch (e) {
      console.warn('[MongoDB] Team query failed, fallback to memory:', e.message);
    }
  }

  if (!inMemoryTeams.has(teamId)) {
    inMemoryTeams.set(teamId, { teamId, ...(teamName ? { teamName } : {}), score: 0, currentRound: 1, updatedAt: new Date() });
  } else if (teamName && !inMemoryTeams.get(teamId).teamName) {
    inMemoryTeams.get(teamId).teamName = teamName;
  }
  return inMemoryTeams.get(teamId);
}

// ==========================================
// TOURNAMENT QUIZ STATE (GATEKEEPER)
// ==========================================
let isQuizStarted = false;

// ==========================================
// REAL-TIME BUZZER STATE
// ==========================================
let activeBuzzerQuestion = null; // { questionIndex, questionText, category, activatedAt }
let buzzerQueue = []; // [ { teamId, reactionTime, timestamp } ]

// ==========================================
// SOCKET.IO REAL-TIME ENGINE
// ==========================================
let io = null;
if (socketIo) {
  io = socketIo(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    // Send active quiz gatekeeper status on connection
    socket.emit('quiz:status', { quizStarted: isQuizStarted });

    // Send active state on connection
    if (activeBuzzerQuestion) {
      socket.emit('buzzer:question_displayed', {
        questionIndex: activeBuzzerQuestion.questionIndex,
        questionText: activeBuzzerQuestion.questionText,
        category: activeBuzzerQuestion.category,
        activatedAt: activeBuzzerQuestion.activatedAt
      });
    }

    // Admin joins
    socket.on('admin:join', () => {
      socket.join('admin_room');
      socket.emit('quiz:status', { quizStarted: isQuizStarted });
      socket.emit('admin:buzzer_queue_update', buzzerQueue);
    });

    // Admin starts tournament quiz
    socket.on('admin:start_quiz', () => {
      isQuizStarted = true;
      io.emit('quiz:started', { quizStarted: true, timestamp: Date.now() });
      io.to('admin_room').emit('quiz:status', { quizStarted: true });
      console.log('[Quiz Gatekeeper] Admin started tournament quiz.');
    });

    // Admin stops / pauses tournament quiz
    socket.on('admin:stop_quiz', () => {
      isQuizStarted = false;
      io.emit('quiz:stopped', { quizStarted: false, timestamp: Date.now() });
      io.to('admin_room').emit('quiz:status', { quizStarted: false });
      console.log('[Quiz Gatekeeper] Admin stopped/paused tournament quiz.');
    });

    // Team registers
    socket.on('team:join', (data) => {
      if (data && data.teamId) {
        socket.teamId = String(data.teamId).trim().toUpperCase();
        socket.join(`team_${socket.teamId}`);
        socket.emit('quiz:status', { quizStarted: isQuizStarted });
      }
    });

    // Admin displays question to all teams
    socket.on('admin:display_question', (data) => {
      if (!data || !data.questionText) return;
      activeBuzzerQuestion = {
        questionIndex: data.questionIndex || 0,
        questionText: data.questionText,
        category: data.category || 'TECHNICAL',
        activatedAt: Date.now()
      };
      buzzerQueue = [];

      // Broadcast to ALL teams: display question + activate buzzer!
      // (Options & correct answer are NEVER broadcasted to candidate teams)
      io.emit('buzzer:question_displayed', {
        questionIndex: activeBuzzerQuestion.questionIndex,
        questionText: activeBuzzerQuestion.questionText,
        category: activeBuzzerQuestion.category,
        activatedAt: activeBuzzerQuestion.activatedAt
      });

      // Update admin queue
      io.to('admin_room').emit('admin:buzzer_queue_update', buzzerQueue);
      console.log(`[Buzzer] Admin displayed question: "${data.questionText.slice(0, 40)}..."`);
    });

    // Team presses buzzer
    socket.on('team:buzz', (data) => {
      const teamId = String(data?.teamId || socket.teamId || '').trim().toUpperCase();
      if (!teamId || !activeBuzzerQuestion) return;

      const alreadyBuzzed = buzzerQueue.some(b => b.teamId === teamId);
      if (alreadyBuzzed) return;

      const now = Date.now();
      const reactionTime = parseFloat(((now - activeBuzzerQuestion.activatedAt) / 1000).toFixed(3));
      const entry = {
        teamId,
        reactionTime: Math.max(0.001, reactionTime),
        timestamp: now
      };

      buzzerQueue.push(entry);
      buzzerQueue.sort((a, b) => a.reactionTime - b.reactionTime);

      const rank = buzzerQueue.findIndex(b => b.teamId === teamId) + 1;

      // Confirm to candidate
      socket.emit('buzzer:buzz_confirmed', {
        rank,
        reactionTime: entry.reactionTime
      });

      // Push real-time queue to Admin
      io.to('admin_room').emit('admin:buzzer_queue_update', buzzerQueue);
      console.log(`[Buzzer] Team ${teamId} buzzed in rank #${rank} (+${entry.reactionTime}s)`);
    });

    // Admin clears buzzer queue
    socket.on('admin:clear_buzzer', () => {
      activeBuzzerQuestion = null;
      buzzerQueue = [];
      io.emit('buzzer:cleared');
      io.to('admin_room').emit('admin:buzzer_queue_update', buzzerQueue);
      console.log('[Buzzer] Admin cleared buzzer round state.');
    });

    // Admin awards or deducts points in Buzzer Round
    socket.on('admin:award_points', async (data) => {
      const { teamId, points } = data || {};
      if (!teamId) return;
      const pts = parseInt(points, 10) || 0;
      const record = await addPointsToTeam(teamId, pts);

      io.emit('score:updated', { teamId: record.teamId, score: record.score });
      io.to('admin_room').emit('score:updated', { teamId: record.teamId, score: record.score });
    });
  });
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Cloud Health Check
app.get(['/healthz', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'MINDMIND Cyber Arena Server',
    mongoConnected: isMongoConnected,
    cachedTeamsCount: inMemoryTeams.size,
    quizStarted: isQuizStarted,
    activeBuzzerQuestion: !!activeBuzzerQuestion,
    buzzerQueueCount: buzzerQueue.length,
    timestamp: new Date().toISOString()
  });
});

// Tournament Quiz Gatekeeper Endpoints
app.get('/api/quiz/status', (req, res) => {
  res.status(200).json({ quizStarted: isQuizStarted });
});

app.post('/api/quiz/start', (req, res) => {
  isQuizStarted = true;
  if (io) {
    io.emit('quiz:started', { quizStarted: true, timestamp: Date.now() });
    io.to('admin_room').emit('quiz:status', { quizStarted: true });
  }
  console.log('[Quiz Gatekeeper] Tournament started via HTTP API.');
  res.status(200).json({ success: true, quizStarted: true });
});

app.post('/api/quiz/stop', (req, res) => {
  isQuizStarted = false;
  if (io) {
    io.emit('quiz:stopped', { quizStarted: false, timestamp: Date.now() });
    io.to('admin_room').emit('quiz:status', { quizStarted: false });
  }
  console.log('[Quiz Gatekeeper] Tournament stopped via HTTP API.');
  res.status(200).json({ success: true, quizStarted: false });
});

// Short-lived, password-derived token for read-only team CSV exports.
// Scoped HMAC tokens work across server restarts and expire after eight hours.
const CSV_TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000;
function csvExportSignature(expiry) {
  return crypto.createHmac('sha256', ADMIN_PASSWORD)
    .update('mindtech-admin-csv-export-v1:' + expiry).digest('hex');
}
function issueCsvExportToken() {
  const expiry = String(Date.now() + CSV_TOKEN_MAX_AGE_MS);
  return expiry + '.' + csvExportSignature(expiry);
}
function isAuthorizedCsvExport(req) {
  if (!ADMIN_PASSWORD) return false;
  const auth = req.get('authorization') || '';
  const match = /^Bearer (\d{13})\.([a-f0-9]{64})$/.exec(auth);
  if (!match) return false;
  const expiry = Number(match[1]);
  if (expiry <= Date.now() || expiry > Date.now() + CSV_TOKEN_MAX_AGE_MS) return false;
  const supplied = Buffer.from(match[2], 'hex');
  const expected = Buffer.from(csvExportSignature(match[1]), 'hex');
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

function csvCell(value) {
  let text = String(value === undefined || value === null ? '' : value);
  // Prevent exported text from being interpreted as a spreadsheet formula.
  if (/^[\s\x00-\x1f]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

// 1. Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true, token: issueCsvExportToken() });
  }
  return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
});

// 2. Team Authentication / Registration
app.post('/api/teams/login', async (req, res) => {
  try {
    const { teamId, teamName } = req.body || {};
    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ error: 'Valid teamId required' });
    }
    if (teamName !== undefined && typeof teamName !== 'string') {
      return res.status(400).json({ error: 'teamName must be a string' });
    }
    const team = await getOrCreateTeam(teamId, teamName);
    res.status(200).json({ success: true, team });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in team' });
  }
});

// 3. Add Points to Single Score Field (Round 1, Round 2, or Admin)
app.post('/api/scores/add', async (req, res) => {
  try {
    const { teamId, points } = req.body || {};
    if (!teamId) return res.status(400).json({ error: 'teamId required' });
    const pts = parseInt(points, 10) || 0;
    const team = await addPointsToTeam(teamId, pts);

    if (io) {
      io.emit('score:updated', { teamId: team.teamId, score: team.score });
    }
    res.status(200).json({ success: true, team });
  } catch (err) {
    res.status(500).json({ error: 'Error updating score' });
  }
});

// 4. Fetch All Teams Leaderboard
app.get('/api/scores', async (req, res) => {
  try {
    let leaderboard = [];
    if (isMongoConnected && Team) {
      leaderboard = await Team.find().sort({ score: -1, updatedAt: 1 }).lean();
    }
    if (!leaderboard || leaderboard.length === 0) {
      leaderboard = Array.from(inMemoryTeams.values()).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      });
    }
    res.status(200).json({ count: leaderboard.length, leaderboard });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching scores' });
  }
});

// Download an authoritative MongoDB snapshot for the next round.
// Qualification is left blank for an admin to set after judging.
app.get('/api/admin/teams/export.csv', async (req, res) => {
  if (!isAuthorizedCsvExport(req)) {
    return res.status(401).json({ error: 'Admin login required to export teams' });
  }
  if (!isMongoConnected || !Team) {
    return res.status(503).json({ error: 'Database unavailable; export aborted to avoid missing teams' });
  }
  try {
    const teams = await Team.find({}, {
      _id: 0, teamId: 1, teamName: 1, score: 1, currentRound: 1
    }).sort({ score: -1, teamId: 1 }).lean();

    const header = ['teamId', 'teamName', 'score', 'currentRound', 'qualified'];
    const lines = [header.join(',')];
    for (const team of teams) {
      lines.push([
        csvCell(team.teamId),
        csvCell(team.teamName || ''),
        csvCell(Number(team.score) || 0),
        csvCell(Number(team.currentRound) || 1),
        csvCell('')
      ].join(','));
    }

    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="mindtech-arena-teams.csv"');
    res.set('Cache-Control', 'private, no-store');
    return res.status(200).send('\uFEFF' + lines.join('\r\n') + '\r\n');
  } catch (error) {
    console.error('[CSV Export] Failed:', error.message);
    return res.status(500).json({ error: 'Could not export team records' });
  }
});

// 5. Reset All Scores
app.post('/api/scores/reset', async (req, res) => {
  try {
    inMemoryTeams.clear();
    if (isMongoConnected && Team) {
      await Team.deleteMany({});
    }
    activeBuzzerQuestion = null;
    buzzerQueue = [];
    isQuizStarted = false;
    if (io) {
      io.emit('scores:reset');
      io.emit('buzzer:cleared');
      io.emit('quiz:stopped', { quizStarted: false });
    }
    res.status(200).json({ success: true, message: 'All scores, quiz status, and buzzer records reset.' });
  } catch (err) {
    res.status(500).json({ error: 'Error resetting scores' });
  }
});

// ==========================================
// HTTP FALLBACKS FOR REAL-TIME BUZZER
// (Guarantees functionality even without WebSockets)
// ==========================================

// Get current buzzer state
app.get('/api/buzzer/state', (req, res) => {
  res.status(200).json({
    activeQuestion: activeBuzzerQuestion,
    queue: buzzerQueue
  });
});

// Admin displays question via HTTP
app.post('/api/buzzer/display', (req, res) => {
  const { questionIndex, questionText, category } = req.body || {};
  if (!questionText) return res.status(400).json({ error: 'questionText required' });

  activeBuzzerQuestion = {
    questionIndex: questionIndex || 0,
    questionText,
    category: category || 'TECHNICAL',
    activatedAt: Date.now()
  };
  buzzerQueue = [];

  if (io) {
    io.emit('buzzer:question_displayed', {
      questionIndex: activeBuzzerQuestion.questionIndex,
      questionText: activeBuzzerQuestion.questionText,
      category: activeBuzzerQuestion.category,
      activatedAt: activeBuzzerQuestion.activatedAt
    });
    io.to('admin_room').emit('admin:buzzer_queue_update', buzzerQueue);
  }

  res.status(200).json({ success: true, activeQuestion: activeBuzzerQuestion });
});

// Team buzzes via HTTP
app.post('/api/buzzer/buzz', (req, res) => {
  const { teamId } = req.body || {};
  const cleanId = String(teamId || '').trim().toUpperCase();
  if (!cleanId || !activeBuzzerQuestion) {
    return res.status(400).json({ error: 'No active question or invalid teamId' });
  }

  const alreadyBuzzed = buzzerQueue.some(b => b.teamId === cleanId);
  if (alreadyBuzzed) {
    const existingRank = buzzerQueue.findIndex(b => b.teamId === cleanId) + 1;
    const existing = buzzerQueue.find(b => b.teamId === cleanId);
    return res.status(200).json({ success: true, rank: existingRank, reactionTime: existing.reactionTime });
  }

  const now = Date.now();
  const reactionTime = parseFloat(((now - activeBuzzerQuestion.activatedAt) / 1000).toFixed(3));
  const entry = {
    teamId: cleanId,
    reactionTime: Math.max(0.001, reactionTime),
    timestamp: now
  };

  buzzerQueue.push(entry);
  buzzerQueue.sort((a, b) => a.reactionTime - b.reactionTime);

  const rank = buzzerQueue.findIndex(b => b.teamId === cleanId) + 1;

  if (io) {
    io.to('admin_room').emit('admin:buzzer_queue_update', buzzerQueue);
  }

  res.status(200).json({ success: true, rank, reactionTime: entry.reactionTime });
});

// Admin clears buzzer via HTTP
app.post('/api/buzzer/clear', (req, res) => {
  activeBuzzerQuestion = null;
  buzzerQueue = [];
  if (io) {
    io.emit('buzzer:cleared');
    io.to('admin_room').emit('admin:buzzer_queue_update', buzzerQueue);
  }
  res.status(200).json({ success: true });
});

// Dedicated dashboard routes
app.get(['/dashboard', '/admin'], (req, res) => {
  res.redirect('/dashboard.html');
});

// Fallback to arena index
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API route not found' });
  res.redirect('/');
});

// Start a port listener only for local/Render hosting. Vercel imports the server directly.
if (require.main === module && !process.env.VERCEL) server.listen(PORT, () => {
  console.log(`[MINDMIND Arena Server] Running on http://localhost:${PORT}`);
  console.log(`[Admin Dashboard] Available at http://localhost:${PORT}/dashboard.html`);
});

module.exports = server;
