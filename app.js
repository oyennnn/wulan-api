require("dotenv").config();
const express = require("express");
const app = express();

const authRoutes = require("./routes/auth");
const forgotRoutes = require("./routes/forgot");
const userRoutes = require("./routes/user");
const kamusRoutes = require("./routes/kamus");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api", authRoutes);
app.use("/api", forgotRoutes);
app.use("/api", userRoutes);
app.use("/api", kamusRoutes);

app.get("/", (req, res) => {
  res.send("API Login Express + MySQL aktif");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
