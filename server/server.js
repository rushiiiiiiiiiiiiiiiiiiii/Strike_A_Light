const express = require('express');
const cors = require('cors');
const db = require('./Conn');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- AUTH ----------------

// Register
app.post('/register', (req, res) => {
  const { name, email, password, role, institutionName } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (role === 'student') {
    // Insert into individual_users table
    const sql = "INSERT INTO individual_users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, password, 10], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, userId: result.insertId });
    });
  } 
  else if (role === 'admin') {
    // Check if institutionName is provided
    if (!institutionName) {
      return res.status(400).json({ error: 'Institution name is required' });
    }

    // Insert into institutions table
    const sql = "INSERT INTO institutions (admin_name, institution_name, email, password) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, institutionName, email, password], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, institutionId: result.insertId });
    });
  } 
  else {
    res.status(400).json({ error: 'Invalid role' });
  }
});
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, error: 'Email, password, and role are required.' });
  }

  const tableMap = {
    individual: 'individual_users',
    institution: 'institutions'
  };

  const tableName = tableMap[role];
  if (!tableName) {
    return res.status(400).json({ success: false, error: 'Invalid role selected.' });
  }

  const sql = `SELECT * FROM \`${tableName}\` WHERE email = ? AND password = ?`;
  db.query(sql, [email, password], (err, rows) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ success: false, error: 'Database query failed.' });
    }

    if (!rows.length) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    res.json({
      success: true,
      role,
      user: rows[0]
    });
  });
});

// ---------------- USERS ----------------

// List users (optional filter by institution)
app.get('/users', (req, res) => {
  const { institutionId } = req.query;
  let sql = "SELECT * FROM users";
  let params = [];
  if (institutionId) {
    sql += " WHERE institutionId=?";
    params.push(institutionId);
  }
  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// GET /user/:id
app.get('/user/:id', (req, res) => {
  const { id } = req.params;
  const { role } = req.query; // 'individual' or 'institution'

  let table = role === 'institution' ? 'institutions' : 'individual_users';
  const sql = `SELECT id, name FROM ${table} WHERE id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json(results[0]);
  });
});


// ---------------- MACHINES ----------------

app.get('/machines/:institutionId', (req, res) => {
  db.query("SELECT * FROM machines WHERE institutionId=?", [req.params.institutionId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------------- SCORES ----------------

// Submit score from C# game
app.post('/submit-score', (req, res) => {
  const { userId, machineId, mode, score, reactionTime, accuracy } = req.body;
  if (!userId || !machineId || !mode || score == null || reactionTime == null || accuracy == null) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const sql = "INSERT INTO scores (userId,machineId,mode,score,reactionTime,accuracy) VALUES (?,?,?,?,?,?)";
  db.query(sql, [userId, machineId, mode, score, reactionTime, accuracy], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    // reduce plays
    db.query("UPDATE users SET remainingPlays = GREATEST(remainingPlays - 1, 0) WHERE userId=?", [userId]);
    res.json({ success: true });
  });
});

// Get scores for user
app.get('/scores/user/:userId', (req, res) => {
  db.query("SELECT * FROM scores WHERE userId=? ORDER BY timestamp ASC", [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get summary for user
app.get('/scores/summary/:userId', (req, res) => {
  db.query("SELECT score,reactionTime,accuracy FROM scores WHERE userId=?", [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.json({ count: 0, avgScore: 0, avgReactionTime: 0, avgAccuracy: 0 });

    const count = rows.length;
    const avgScore = rows.reduce((s, r) => s + r.score, 0) / count;
    const avgReactionTime = rows.reduce((s, r) => s + r.reactionTime, 0) / count;
    const avgAccuracy = rows.reduce((s, r) => s + r.accuracy, 0) / count;

    res.json({
      count,
      avgScore: Number(avgScore.toFixed(2)),
      avgReactionTime: Number(avgReactionTime.toFixed(3)),
      avgAccuracy: Number(avgAccuracy.toFixed(2)),
    });
  });
});

// ---------------- REPORTS (stub) ----------------
app.get('/reports/user/:userId', (req, res) => {
  res.json({ reportUrl: `https://example.com/report/${req.params.userId}.pdf` });
});

// ---------------- SERVER START ----------------
app.listen(8000, () => {
  console.log('✅ Server running on PORT 8000');
});
