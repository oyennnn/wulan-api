const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Email tidak ditemukan" });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(400).json({ message: "Password salah" });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }
  );
});

router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  // Cek apakah email sudah terdaftar
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (results.length > 0) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user baru
      db.query(
        "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, phone],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Gagal mendaftar" });

          res.status(201).json({ message: "Registrasi berhasil" });
        }
      );
    }
  );
});

module.exports = router;
