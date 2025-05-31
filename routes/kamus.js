const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Setup multer untuk simpan gambar ke folder 'uploads/'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // nama unik
  },
});

const upload = multer({ storage: storage });

// API untuk input kamus baru
router.post("/kamus", upload.single("gambar_pola"), (req, res) => {
  const { nama_pola } = req.body;

  if (!nama_pola) {
    return res.status(400).json({ message: "Field nama_pola wajib diisi" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Gambar pola wajib diupload" });
  }

  const gambar_pola = req.file.filename;

  db.query(
    "INSERT INTO kamus (nama_pola, gambar_pola) VALUES (?, ?)",
    [nama_pola, gambar_pola],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Gagal menyimpan data kamus" });
      }
      res.json({ message: "Kamus berhasil disimpan", id: result.insertId });
    }
  );
});

// API untuk ambil semua data kamus
router.get("/kamus", (req, res) => {
  db.query("SELECT * FROM kamus", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal mengambil data kamus" });
    }

    // Mapping agar gambar_pola jadi full URL (misal: http://192.168.1.9:3000/uploads/nama.jpg)
    const data = results.map((item) => ({
      ...item,
      gambar_pola: `http://192.168.1.9:3000/uploads/${item.gambar_pola}`,
    }));

    res.json(data);
  });
});

module.exports = router;
