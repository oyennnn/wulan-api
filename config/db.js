const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT || 8080,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected!");
});

module.exports = connection;
