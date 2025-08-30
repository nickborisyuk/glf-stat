import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configure CORS for production
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || '*' 
    : '*',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// File-based data storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'rounds.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load data from file
async function loadData() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return {
      rounds: new Map(parsed.rounds || []),
      players: new Map(parsed.players || [])
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty Maps
      return { rounds: new Map(), players: new Map() };
    }
    console.error('Error loading data:', error);
    return { rounds: new Map(), players: new Map() };
  }
}

// Save data to file
async function saveData(rounds, players) {
  try {
    await ensureDataDir();
    const data = {
      rounds: Array.from(rounds.entries()),
      players: Array.from(players.entries())
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// In-memory data storage (will be loaded from file)
let rounds = new Map();
let players = new Map();

/**
 * round = {
 *   id: string,
 *   date: string, // ISO date
 *   course: string,
 *   courseType: 'championship' | 'academic', // 18 or 9 holes
 *   players: Array<string>, // player IDs
 *   holes: { [holeId: string]: Array<Shot> }
 * }
 * Shot = { 
 *   shotNumber: number, 
 *   playerId: string,
 *   club: string, 
 *   distance: number, 
 *   result: 'success' | 'fail',
 *   location: string,
 *   targetLocation: string
 * }
 * Player = {
 *   id: string,
 *   name: string,
 *   color: string
 * }
 */

function createEmptyHoles(courseType = 'championship') {
  const holes = {};
  const maxHoles = courseType === 'academic' ? 9 : 18;
  for (let i = 1; i <= maxHoles; i += 1) holes[String(i)] = [];
  return holes;
}

function getRoundOr404(req, res) {
  const { id } = req.params;
  const round = rounds.get(id);
  if (!round) {
    res.status(404).json({ error: 'Round not found' });
    return null;
  }
  return round;
}

// API Routes

// Players management
// POST /players — create new player
app.post('/api/players', async (req, res) => {
  const { name, color } = req.body || {};
  if (!name || !color) {
    return res.status(400).json({ error: 'Missing required fields: name, color' });
  }
  const id = nanoid(10);
  const player = { id, name, color };
  players.set(id, player);
  await saveData(rounds, players);
  return res.status(201).json(player);
});

// GET /players — list all players
app.get('/api/players', async (_req, res) => {
  const list = Array.from(players.values());
  res.json(list);
});

// DELETE /players/:id — delete player
app.delete('/api/players/:id', async (req, res) => {
  const { id } = req.params;
  const player = players.get(id);
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }
  players.delete(id);
  await saveData(rounds, players);
  return res.status(200).json({ message: 'Player deleted successfully' });
});

// POST /rounds — create new round
app.post('/api/rounds', async (req, res) => {
  const { date, course, courseType, playerIds } = req.body || {};
  if (!date || !course || !courseType || !playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: date, course, courseType, playerIds (array)' });
  }
  
  // Validate courseType
  if (!['championship', 'academic'].includes(courseType)) {
    return res.status(400).json({ error: 'courseType must be either "championship" or "academic"' });
  }
  
  // Validate that all players exist
  for (const playerId of playerIds) {
    if (!players.has(playerId)) {
      return res.status(400).json({ error: `Player with id ${playerId} not found` });
    }
  }
  
  const id = nanoid(10);
  const round = { id, date, course, courseType, players: playerIds, holes: createEmptyHoles(courseType) };
  rounds.set(id, round);
  await saveData(rounds, players);
  return res.status(201).json(round);
});

// GET /rounds — list all rounds (without holes details to keep payload small)
app.get('/api/rounds', async (_req, res) => {
  const list = Array.from(rounds.values()).map((r) => ({ id: r.id, date: r.date, course: r.course }));
  res.json(list);
});

// GET /rounds/:id — get round by id
app.get('/api/rounds/:id', async (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return; // response already sent
  res.json(round);
});

// POST /rounds/:id/holes/:holeId/shots — add shot
app.post('/api/rounds/:id/holes/:holeId/shots', async (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;

  const { holeId } = req.params;
  const { shotNumber, playerId, club, distance, result, location, targetLocation } = req.body || {};

  if (!round.holes[holeId]) {
    return res.status(400).json({ error: 'Invalid holeId. Must be 1-18' });
  }
  if (!playerId || !club || typeof distance !== 'number' || !['success', 'fail'].includes(result)) {
    return res.status(400).json({ error: 'Missing/invalid fields: playerId, club, distance (number), result (success|fail)' });
  }
  
  // Validate player is part of this round
  if (!round.players.includes(playerId)) {
    return res.status(400).json({ error: 'Player is not part of this round' });
  }
  
  const validLocations = ['tee', 'left_rough', 'right_rough', 'fairway', 'left_woods', 'right_woods', 'green', 'other'];
  if (location && !validLocations.includes(location)) {
    return res.status(400).json({ error: 'Invalid location. Must be one of: tee, left_rough, right_rough, fairway, left_woods, right_woods, green, other' });
  }
  if (targetLocation && !validLocations.includes(targetLocation)) {
    return res.status(400).json({ error: 'Invalid targetLocation. Must be one of: tee, left_rough, right_rough, fairway, left_woods, right_woods, green, other' });
  }

  const shots = round.holes[holeId];
  const nextShotNumber = typeof shotNumber === 'number' ? shotNumber : shots.length + 1;
  const shot = { 
    shotNumber: nextShotNumber, 
    playerId, 
    club, 
    distance, 
    result, 
    location: location || 'other',
    targetLocation: targetLocation || 'other'
  };
  shots.push(shot);
  await saveData(rounds, players);
  return res.status(201).json({ holeId, shot });
});

// DELETE /rounds/:id/holes/:holeId/shots/last — delete last shot
app.delete('/api/rounds/:id/holes/:holeId/shots/last', async (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;

  const { holeId } = req.params;
  
  if (!round.holes[holeId]) {
    return res.status(400).json({ error: 'Invalid holeId. Must be 1-18' });
  }

  const shots = round.holes[holeId];
  if (shots.length === 0) {
    return res.status(404).json({ error: 'No shots to delete' });
  }

  const deletedShot = shots.pop();
  await saveData(rounds, players);
  return res.status(200).json({ 
    message: 'Last shot deleted successfully',
    deletedShot,
    remainingShots: shots.length 
  });
});

function computeRoundStats(round) {
  let total = 0;
  let success = 0;
  Object.values(round.holes).forEach((shots) => {
    shots.forEach((s) => {
      total += 1;
      if (s.result === 'success') success += 1;
    });
  });
  const failed = total - success;
  const percent = (n) => (total === 0 ? 0 : Math.round((n / total) * 100));
  return {
    totalShots: total,
    successPercent: percent(success),
    failPercent: percent(failed),
  };
}

function computeClubStats(round) {
  const byClub = new Map();
  Object.values(round.holes).forEach((shots) => {
    shots.forEach((s) => {
      if (!byClub.has(s.club)) byClub.set(s.club, []);
      byClub.get(s.club).push(s);
    });
  });

  const result = [];
  byClub.forEach((shots, club) => {
    const count = shots.length;
    const avgDistance = count === 0 ? 0 : Math.round(shots.reduce((sum, s) => sum + s.distance, 0) / count);
    const successCount = shots.filter((s) => s.result === 'success').length;
    const successPercent = count === 0 ? 0 : Math.round((successCount / count) * 100);
    result.push({ club, shots: count, avgDistance, successPercent });
  });
  return result;
}

function computeLocationStats(round) {
  const byLocation = new Map();
  Object.values(round.holes).forEach((shots) => {
    shots.forEach((s) => {
      const location = s.location || 'other';
      if (!byLocation.has(location)) byLocation.set(location, []);
      byLocation.get(location).push(s);
    });
  });

  const result = [];
  byLocation.forEach((shots, location) => {
    const count = shots.length;
    const avgDistance = count === 0 ? 0 : Math.round(shots.reduce((sum, s) => sum + s.distance, 0) / count);
    const successCount = shots.filter((s) => s.result === 'success').length;
    const successPercent = count === 0 ? 0 : Math.round((successCount / count) * 100);
    result.push({ location, shots: count, avgDistance, successPercent });
  });
  return result;
}

// GET /rounds/:id/holes/:holeId/players/:playerId/last-shot — get last shot for player
app.get('/api/rounds/:id/holes/:holeId/players/:playerId/last-shot', async (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;

  const { holeId, playerId } = req.params;
  
  if (!round.holes[holeId]) {
    return res.status(400).json({ error: 'Invalid holeId. Must be 1-18' });
  }

  const shots = round.holes[holeId];
  const playerShots = shots.filter(s => s.playerId === playerId);
  
  if (playerShots.length === 0) {
    return res.status(404).json({ error: 'No shots found for this player' });
  }

  const lastShot = playerShots[playerShots.length - 1];
  res.json({ lastShot });
});

// GET /rounds/:id/stats — overall stats
app.get('/api/rounds/:id/stats', async (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;
  res.json(computeRoundStats(round));
});

// GET /rounds/:id/stats/clubs — per-club stats
app.get('/api/rounds/:id/stats/clubs', async (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;
  res.json(computeClubStats(round));
});

// GET /rounds/:id/stats/locations — per-location stats
app.get('/api/rounds/:id/stats/locations', async (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;
  res.json(computeLocationStats(round));
});

app.get('/api', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'glf-stat server',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: NODE_ENV
  });
});

// Serve a simple HTML page for the root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GLF Stat - Golf Statistics</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f7; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #1d1d1f; margin-bottom: 20px; }
            p { color: #86868b; line-height: 1.6; }
            .api-link { display: inline-block; background: #007aff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            .status { background: #f2f2f7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏌️ GLF Stat</h1>
            <p>Golf Statistics Tracking Application</p>
            
            <div class="status">
                <strong>Status:</strong> API Server Running ✅<br>
                <strong>Environment:</strong> ${NODE_ENV}<br>
                <strong>Timestamp:</strong> ${new Date().toISOString()}
            </div>
            
            <p>This is the API server for the GLF Stat golf statistics application. The React frontend should be deployed separately.</p>
            
            <a href="/api/health" class="api-link">Check API Health</a>
            <a href="/api" class="api-link" style="margin-left: 10px;">API Status</a>
        </div>
    </body>
    </html>
  `);
});

// Initialize data and start server
async function startServer() {
  try {
    console.log('📂 Loading data from file...');
    const data = await loadData();
    rounds = data.rounds;
    players = data.players;
    console.log(`📊 Loaded ${rounds.size} rounds and ${players.size} players from storage`);
  } catch (error) {
    console.error('❌ Error loading data:', error);
    rounds = new Map();
    players = new Map();
  }

  // Only start the server if this file is run directly
  if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`💾 Data file: ${DATA_FILE}`);
    });
  }
}

startServer();

export default app;


