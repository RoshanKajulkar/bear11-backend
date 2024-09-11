require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = process.env.PORT || 3000;

// Set up PostgreSQL connection
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Define a GET endpoint to query PostgreSQL
app.get("/api/bear11/data", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM market_data WHERE date = CURRENT_DATE;"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error querying PostgreSQL", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
