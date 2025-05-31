const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Route GET /user untuk mendapatkan data user berdasarkan token
router.get("/user/:id", (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT id, name, email, phone FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (results.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      res.json({ user: results[0] });
    }
  );
});

router.put("/user/:id", async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, phone } = req.body;

  // Validasi sederhana, bisa dikembangkan
  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  let sql, params;

  if (password && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, 10);
    sql =
      "UPDATE users SET name = ?, email = ?, password = ?, phone = ? WHERE id = ?";
    params = [name, email, hashedPassword, phone, userId];
  } else {
    sql = "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?";
    params = [name, email, phone, userId];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ message: "Update berhasil" });
  });
});

module.exports = router;
