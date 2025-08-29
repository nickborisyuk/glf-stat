import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

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

// In-memory data storage
/**
 * round = {
 *   id: string,
 *   date: string, // ISO date
 *   course: string,
 *   holes: { [holeId: string]: Array<Shot> }
 * }
 * Shot = { shotNumber: number, club: string, distance: number, result: 'success' | 'fail' }
 */
const rounds = new Map();

function createEmptyHoles() {
  const holes = {};
  for (let i = 1; i <= 18; i += 1) holes[String(i)] = [];
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

// POST /rounds — create new round
app.post('/rounds', (req, res) => {
  const { date, course } = req.body || {};
  if (!date || !course) {
    return res.status(400).json({ error: 'Missing required fields: date, course' });
  }
  const id = nanoid(10);
  const round = { id, date, course, holes: createEmptyHoles() };
  rounds.set(id, round);
  return res.status(201).json(round);
});

// GET /rounds — list all rounds (without holes details to keep payload small)
app.get('/rounds', (_req, res) => {
  const list = Array.from(rounds.values()).map((r) => ({ id: r.id, date: r.date, course: r.course }));
  res.json(list);
});

// GET /rounds/:id — get round by id
app.get('/rounds/:id', (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return; // response already sent
  res.json(round);
});

// POST /rounds/:id/holes/:holeId/shots — add shot
app.post('/rounds/:id/holes/:holeId/shots', (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;

  const { holeId } = req.params;
  const { shotNumber, club, distance, result } = req.body || {};

  if (!round.holes[holeId]) {
    return res.status(400).json({ error: 'Invalid holeId. Must be 1-18' });
  }
  if (!club || typeof distance !== 'number' || !['success', 'fail'].includes(result)) {
    return res.status(400).json({ error: 'Missing/invalid fields: club, distance (number), result (success|fail)' });
  }

  const shots = round.holes[holeId];
  const nextShotNumber = typeof shotNumber === 'number' ? shotNumber : shots.length + 1;
  const shot = { shotNumber: nextShotNumber, club, distance, result };
  shots.push(shot);
  return res.status(201).json({ holeId, shot });
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

// GET /rounds/:id/stats — overall stats
app.get('/rounds/:id/stats', (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;
  res.json(computeRoundStats(round));
});

// GET /rounds/:id/stats/clubs — per-club stats
app.get('/rounds/:id/stats/clubs', (req, res) => {
  const round = getRoundOr404(req, res);
  if (!round) return;
  res.json(computeClubStats(round));
});

app.get('/', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'glf-stat server',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: NODE_ENV
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});


