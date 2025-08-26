const express = require("express");
const cors = require("cors");
const db = require("./Conn");

const app = express();
app.use(cors());
app.use(express.json());

  /* ================= AUTH ================= */

  // Register
app.post("/register", (req, res) => {
  const { name, email, password, role, institutionName } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (role === "student") {
    const sql =
      "INSERT INTO individual_users (name, email, password, role) VALUES (?, ?, ?, 'user')";
    db.query(sql, [name, email, password], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, userId: result.insertId });
    });
  } else if (role === "admin") {
    if (!institutionName) {
      return res.status(400).json({ error: "Institution name is required" });
    }

    const sql =
      "INSERT INTO institutions (admin_name, institution_name, email, password, role) VALUES (?, ?, ?, ?, 'institution')";
    db.query(sql, [name, institutionName, email, password], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, institutionId: result.insertId });
    });
  } else {
    res.status(400).json({ error: "Invalid role" });
  }
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password are required." });
  }

  const queries = [
    { table: "individual_users", roleField: "individual" },
    { table: "institutions", roleField: "institution" },
  ];

  let foundUser = null;

  const checkNext = (index) => {
    if (index >= queries.length) {
      if (!foundUser) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid credentials." });
      }
      return res.json({
        success: true,
        role: foundUser.role,
        user: foundUser,
      });
    }

    const { table, roleField } = queries[index];
    const sql = `SELECT * FROM \`${table}\` WHERE email = ? AND password = ? LIMIT 1`;

    db.query(sql, [email, password], (err, rows) => {
      if (err) {
        console.error("DB Error:", err);
        return res
          .status(500)
          .json({ success: false, error: "Database query failed." });
      }

      if (rows.length > 0) {
        const user = rows[0];
        user.role = user.role === "super_admin" ? "super_admin" : roleField;
        foundUser = user;
        return res.json({ success: true, role: user.role, user });
      } else {
        checkNext(index + 1);
      }
    });
  };

  checkNext(0);
});
/* ================= USER & STUDENT DETAILS ================= */

// Get single student by ID
app.get("/studentsdata/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM students WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("Error fetching student:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(rows[0]);
  });
});

// Get single individual user by ID
app.get("/userdata/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM individual_users WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(rows[0]);
  });
});

/* ================= STUDENTS ================= */

// Add student
app.post("/students", (req, res) => {
  const { name, email, standard, division, rollNumber, institutionId } =
    req.body;

  if (!name || !email || !standard || !division || !rollNumber || !institutionId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sql = `INSERT INTO students 
    (name, email, standard, division, roll_number, institution_id, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())`;

  db.query(
    sql,
    [name, email, standard, division, rollNumber, institutionId],
    (err, result) => {
      if (err) {
        console.error("Error inserting student:", err);
        return res.status(500).json({ error: "Failed to add student" });
      }
      res.status(201).json({
        id: result.insertId,
        name,
        email,
        standard,
        division,
        roll_number: rollNumber,
        institution_id: institutionId,
      });
    }
  );
});

// Fetch students for institution
app.get("/students/:institutionId", (req, res) => {
  const { institutionId } = req.params;
  db.query(
    "SELECT * FROM students WHERE institution_id = ? ORDER BY created_at DESC",
    [institutionId],
    (err, rows) => {
      if (err) {
        console.error("Error fetching students:", err);
        return res.status(500).json({ error: "Failed to fetch students" });
      }
      res.json(rows);
    }
  );
});

// Delete student
app.delete("/students/:studentId", (req, res) => {
  const { studentId } = req.params;
  db.query("DELETE FROM students WHERE id = ?", [studentId], (err, result) => {
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

/* ================= SUPER ADMIN ================= */

// Stats
app.get("/super-admin/stats", (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) AS total FROM individual_users", (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    stats.totalUsers = rows[0].total;

    db.query("SELECT COUNT(*) AS total FROM institutions", (err2, rows2) => {
      if (err2) return res.status(500).json({ error: err2 });
      stats.totalInstitutions = rows2[0].total;

      res.json(stats);
    });
  });
});

// All users
app.get("/super-admin/users", (req, res) => {
  const search = req.query.search || "";
  db.query(
    "SELECT * FROM individual_users WHERE (name LIKE ? OR email LIKE ?) AND role != 'super_admin'",
    [`%${search}%`, `%${search}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});
// All institutions
// All users (exclude super_admins)
// All users
app.get("/super-admin/users", (req, res) => {
  const search = req.query.search || "";
  db.query(
    "SELECT * FROM individual_users WHERE (name LIKE ? OR email LIKE ?) AND role != 'super_admin'",
    [`%${search}%`, `%${search}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});
// ✅ Institution Data Route
app.get("/instdata/:institutionId", (req, res) => {
  const { institutionId } = req.params;

  const sql = "SELECT * FROM institutions WHERE id = ?";
  db.query(sql, [institutionId], (err, result) => {
    if (err) {
      console.error("Error fetching institution data:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Institution not found" });
    }

    res.json(result); // returns array → frontend uses result[0]
  });
});

app.get('/admindata/:adminid', (req, res) => {
  const adminid = req.params.adminid; // ✅ use params
  db.query(
    "SELECT * FROM institutions WHERE id = ?",
    [adminid], // ✅ pass parameter safely
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }
      res.json(result[0]); // ✅ send single user
    }
  );
});


// All institutions (only from institutions table, exclude super_admins if any)
app.get("/super-admin/institutions", (req, res) => {
  const search = req.query.search || "";
  db.query(
    "SELECT * FROM institutions WHERE institution_name LIKE ? AND role != 'super_admin'",
    [`%${search}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

// Students of institution
app.get("/super-admin/institution/:id/students", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM students WHERE institution_id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});
// Get single student by ID
app.get("/students/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM students WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch student" });
    if (!rows.length) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  });
});

const crypto = require("crypto");

/* ================= VOUCHERS ================= */

// Create voucher
app.post("/vouchers", (req, res) => {
  const { studentId, institutionId, assignedPlays, amountPaid, expiresInMinutes } = req.body;

  if (!studentId || !institutionId || !assignedPlays) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const token = crypto.randomBytes(16).toString("hex"); // secure random token
  const expiresAt = expiresInMinutes
    ? new Date(Date.now() + expiresInMinutes * 60 * 1000)
    : null;

  const sql = `
    INSERT INTO vouchers (token, student_id, institution_id, assigned_plays, amount_paid, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [token, studentId, institutionId, assignedPlays, amountPaid || 0, expiresAt], (err, result) => {
    if (err) {
      console.error("Error creating voucher:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      id: result.insertId,
      token,
      assignedPlays,
      amountPaid: amountPaid || 0,
      expiresAt,
    });
  });
});

// Redeem voucher (machine endpoint)
app.post("/vouchers/:token/redeem", (req, res) => {
  const { token } = req.params;

  // Use transaction for atomicity
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: "Transaction error" });

    db.query("SELECT * FROM vouchers WHERE token = ? FOR UPDATE", [token], (err, rows) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: "DB error" }));
      }
      if (!rows.length) {
        return db.rollback(() => res.status(404).json({ error: "Voucher not found" }));
      }

      const voucher = rows[0];

      // Validation
      if (voucher.status !== "active") {
        return db.rollback(() => res.status(400).json({ error: "Voucher not active" }));
      }
      if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
        return db.rollback(() => res.status(410).json({ error: "Voucher expired" }));
      }
      if (voucher.used_plays >= voucher.assigned_plays) {
        return db.rollback(() => res.status(409).json({ error: "No plays remaining" }));
      }

      // Update usage
      const newUsed = voucher.used_plays + 1;
      db.query("UPDATE vouchers SET used_plays = ? WHERE id = ?", [newUsed, voucher.id], (err2) => {
        if (err2) {
          return db.rollback(() => res.status(500).json({ error: "Failed to redeem" }));
        }

        db.commit((err3) => {
          if (err3) {
            return db.rollback(() => res.status(500).json({ error: "Commit failed" }));
          }

          res.json({
            ok: true,
            remainingPlays: voucher.assigned_plays - newUsed,
          });
        });
      });
    });
  });
});

// Check voucher status
app.get("/vouchers/:token", (req, res) => {
  const { token } = req.params;
  db.query("SELECT * FROM vouchers WHERE token = ?", [token], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  });
});


/* ================= SERVER START ================= */
app.listen(8000, () => {
  console.log("✅ Server running on PORT 8000");
});
