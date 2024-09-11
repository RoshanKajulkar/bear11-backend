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

app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM market_data WHERE date = CURRENT_DATE;"
    );

    const data = result.rows;

    let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pragati Share Market</title>
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    table, th, td {
                        border: 1px solid black;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    h1 {
                        text-align: center; 
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>Bear11 Filtered Stocks</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Symbol</th>
                            <th>Is Green</th>
                            <th>Trade Window</th>
                            <th>First Candle High</th>
                            <th>First Candle Low</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    data.forEach((item) => {
      html += `
                <tr>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.symbol}</td>
                    <td>${item.is_green}</td>
                    <td>${item.trade_window}</td>
                    <td>${item.first_candle_high}</td>
                    <td>${item.first_candle_low}</td>
                </tr>
            `;
    });

    html += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

    res.send(html);
  } catch (err) {
    console.error("Error", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
