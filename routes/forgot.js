const express = require("express");
const router = express.Router();
const db = require("../config/db");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Simpan OTP sementara
let otpStore = {};

// 🔹 1. Kirim OTP ke Email
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0)
      return res.status(404).json({ message: "Email tidak ditemukan" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000);

    db.query(
      "INSERT INTO otp (email, kode_otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiredAt],
      (errInsert) => {
        if (errInsert) {
          console.log(errInsert);
          return res.status(500).json({ message: "Gagal menyimpan OTP" });
        }

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Kode OTP Reset Password",
          text: `Kode OTP kamu adalah: ${otp}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            return res.status(500).json({ message: "Gagal mengirim email" });
          } else {
            return res.json({ message: "success" });
          }
        });
      }
    );
  });
});

// 🔹 2. Verifikasi OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  db.query(
    "SELECT * FROM otp WHERE email = ? ORDER BY expires_at DESC LIMIT 1",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (results.length === 0)
        return res.status(400).json({ message: "OTP tidak ditemukan" });

      const savedOtp = results[0];

      const now = new Date();

      if (now > savedOtp.expires_at)
        return res.status(400).json({ message: "OTP kadaluarsa" });

      if (parseInt(otp) !== parseInt(savedOtp.kode_otp))
        return res.status(400).json({ message: "OTP salah" });

      res.json({ message: "OTP valid" });
    }
  );
});

// 🔹 3. Reset Password
router.post("/reset-password", (req, res) => {
  const { email, newPassword } = req.body;

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  db.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [hashedPassword, email],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal reset password" });

      // Hapus OTP dari database
      db.query("DELETE FROM otp WHERE email = ?", [email], (errDelete) => {
        if (errDelete) {
          console.log("Gagal hapus OTP:", errDelete);
          // Tetap kirim response sukses karena password udah direset
        }
        res.json({ message: "Password berhasil direset" });
      });
    }
  );
});

module.exports = router;
