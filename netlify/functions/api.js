const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage (for demo purposes)
let rounds = new Map();
let players = new Map();

// API Version
const API_VERSION = '0.31.160959';

// Helper functions
function createEmptyHoles(courseType = 'championship') {
  const holes = {};
  const maxHoles = courseType === 'academic' ? 9 : 18;
  for (let i = 1; i <= maxHoles; i += 1) {
    holes[String(i)] = [];
  }
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

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    version: API_VERSION
  });
});

// GET /api/version
app.get('/api/version', (req, res) => {
  res.json({ 
    version: API_VERSION,
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// POST /api/players
app.post('/api/players', (req, res) => {
  const { name, color } = req.body || {};
  if (!name || !color) {
    return res.status(400).json({ error: 'Missing required fields: name, color' });
  }
  
  const id = nanoid(10);
  const player = { id, name, color };
  players.set(id, player);
  return res.status(201).json(player);
});

// GET /api/players
app.get('/api/players', (req, res) => {
  const list = Array.from(players.values());
  res.json(list);
});

// DELETE /api/players/:id
app.delete('/api/players/:id', (req, res) => {
  const { id } = req.params;
  const player = players.get(id);
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }
  players.delete(id);
  return res.status(200).json({ message: 'Player deleted successfully' });
});

// POST /api/rounds
app.post('/api/rounds', (req, res) => {
  const { date, course, courseType, playerIds } = req.body || {};
  if (!date || !course || !courseType || !playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: date, course, courseType, playerIds (array)' });
  }
  
  if (!['championship', 'academic'].includes(courseType)) {
    return res.status(400).json({ error: 'courseType must be either "championship" or "academic"' });
  }
  
  for (const playerId of playerIds) {
    if (!players.has(playerId)) {
      return res.status(400).json({ error: `Player with id ${playerId} not found` });
    }
  }
  
  const id = nanoid(10);
  const round = { id, date, course, courseType, players: playerIds, holes: createEmptyHoles(courseType) };
  rounds.set(id, round);
  return res.status(201).json(round);
});

// GET /api/rounds
app.get('/api/rounds', (req, res) => {
  const list = Array.from(rounds.values()).map((r) => ({ id: r.id, date: r.date, course: r.course }));
  res.json(list);
});

// GET /api/rounds/:id
app.get('/api/rounds/:id', (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;
  res.json(round);
});

// POST /api/rounds/:id/holes/:holeId/shots
app.post('/api/rounds/:id/holes/:holeId/shots', (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;

  const { holeId } = req.params;
  const { shotNumber, playerId, club, distance, result, location, targetLocation, error, isPenalty } = req.body || {};

  if (!round.holes[holeId]) {
    return res.status(400).json({ error: 'Invalid holeId. Must be 1-18' });
  }
  if (!playerId || !club || typeof distance !== 'number' || !['success', 'fail'].includes(result)) {
    return res.status(400).json({ error: 'Missing/invalid fields: playerId, club, distance (number), result (success|fail)' });
  }

  if (result === 'fail' && !error) {
    return res.status(400).json({ error: 'Error field is required for failed shots' });
  }

  if (!round.players.includes(playerId)) {
    return res.status(400).json({ error: 'Player is not part of this round' });
  }
  
  const shots = round.holes[holeId];
  const playerShots = shots.filter(s => s.playerId === playerId);
  const nextShotNumber = typeof shotNumber === 'number' ? shotNumber : playerShots.length + 1;
  
  const shot = { 
    shotNumber: nextShotNumber, 
    playerId, 
    club, 
    distance, 
    result, 
    location: location || 'other',
    targetLocation: targetLocation || 'other',
    isPenalty: isPenalty || false
  };

  if (result === 'fail') {
    shot.error = error;
  }
  shots.push(shot);
  return res.status(201).json({ holeId, shot });
});

// DELETE /api/rounds/:id/holes/:holeId/shots/last
app.delete('/api/rounds/:id/holes/:holeId/shots/last', (req, res) => {
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
  return res.status(200).json({ 
    message: 'Last shot deleted successfully',
    deletedShot,
    remainingShots: shots.length 
  });
});

// PUT /api/rounds/:id/holes/:holeId/shots/:shotNumber
app.put('/api/rounds/:id/holes/:holeId/shots/:shotNumber', (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;

  const { holeId, shotNumber } = req.params;
  const { distance, playerId } = req.body || {};

  if (!round.holes[holeId]) {
    return res.status(400).json({ error: 'Invalid holeId. Must be 1-18' });
  }

  const shots = round.holes[holeId];
  const shot = shots.find(s => s.shotNumber === parseInt(shotNumber) && s.playerId === playerId);
  
  if (!shot) {
    return res.status(404).json({ error: 'Shot not found' });
  }

  if (typeof distance === 'number') {
    shot.distance = distance;
  }

  return res.status(200).json({ 
    message: 'Shot updated successfully',
    shot
  });
});

// POST /api/clear-all-data
app.post('/api/clear-all-data', (req, res) => {
  rounds.clear();
  players.clear();
  return res.json({ 
    message: 'All data cleared successfully',
    cleared: {
      rounds: 0,
      players: 0
    },
    timestamp: new Date().toISOString()
  });
});

// Export the serverless function
module.exports.handler = serverless(app);
