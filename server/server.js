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
//get insitution

app.get('/instdata/:institutionId', (req, res)=>{
  const institutionId = req.params.institutionId;
  const sql = 'SELECT * FROM institutions WHERE id=?'
  db.query(sql, [institutionId], (err, row)=>{
     if (err) {
      console.error("Error fetching institution data:", err);
      return res.status(500).json({ error: "Failed to fetch institution data" });
    }
    res.json(row);

  })
})

// ADD student
app.post("/students", (req, res) => {
  const { name, email, standard, division, rollNumber, institutionId } = req.body;

  if (!name || !email || !standard || !division || !rollNumber || !institutionId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sql = `INSERT INTO students 
    (name, email, standard, division, roll_number, institution_id, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())`;

  db.query(sql, [name, email, standard, division, rollNumber, institutionId], (err, result) => {
    if (err) {
      console.error("Error inserting student:", err);
      return res.status(500).json({ error: "Failed to add student" });
    }
    res.status(201).json({ 
      id: result.insertId, 
      name, email, standard, division, roll_number: rollNumber, institution_id: institutionId 
    });
  });
});

// FETCH students for an institution (MySQL version)
app.get("/students/:institutionId", (req, res) => {
  const { institutionId } = req.params;
  console.log(req.params)
  const sql = "SELECT * FROM students WHERE institution_id = ? ORDER BY created_at DESC";
  db.query(sql, [institutionId], (err, rows) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ error: "Failed to fetch students" });
    }
    res.json(rows);
  });
});

app.get("/studentsdata/:id", (req, res) => {
  const  id  = req.params.id;
  const sql = "SELECT * FROM students WHERE id = ?";
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("Error fetching student:", err);
      return res.status(500).json({ error: "Failed to fetch student" });
    }
    if (!rows.length) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(rows[0]); // ✅ send single student
  });
});
app.get("/userdata/:id", (req, res) => {
  const  id  = req.params.id;
  const sql = "SELECT * FROM individual_users WHERE id = ?";
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
    if (!rows.length) {
      return res.status(404).json({ error: "users not found" });
    }
    res.json(rows[0]); // ✅ send single student
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
// DELETE student by ID
app.delete("/students/:studentId", (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ error: "Student ID is required" });
  }

  const sql = "DELETE FROM students WHERE id = ?";
  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error("Error deleting student:", err);
      return res.status(500).json({ error: "Failed to delete student" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });
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
