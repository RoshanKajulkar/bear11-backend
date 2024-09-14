require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = process.env.PORT || 3000;
const axios = require("axios");
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

const secretTokens = process.env.USER_SECRETS;

app.get("/", async (req, res) => {
  try {
    const userToken = req.query.s;
    let risk = req.query.risk || 1000;

    if (!secretTokens.split(",").includes(userToken)) {
      return res.status(403).send("Access denied: Invalid secret token.");
    }

    const result = await pool.query(
      "SELECT * FROM market_data WHERE date = '2024-09-13';"
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
                      body {
                          font-family: Arial, sans-serif;
                          margin: 0;
                          padding: 20px;
                      }
                      h1 {
                          text-align: center;
                          margin-bottom: 20px;
                      }
                      #risk-input {
                          text-align: center;
                          margin-bottom: 20px;
                      }
                      input[type="number"] {
                          padding: 10px;
                          font-size: 16px;
                          width: 200px;
                          margin-right: 10px;
                      }
                      button {
                          padding: 10px 20px;
                          font-size: 16px;
                          background-color: #007BFF;
                          color: white;
                          border: none;
                          border-radius: 5px;
                          cursor: pointer;
                      }
                      button:hover {
                          background-color: #0056b3;
                      }
                      .stock-card {
                          border: 1px solid #ddd;
                          border-radius: 8px;
                          padding: 15px;
                          margin-bottom: 20px;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                      }
                      .stock-card .field {
                          margin-bottom: 10px;
                      }
                      .stock-card .label {
                          font-weight: bold;
                      }
                      @media (min-width: 600px) {
                          .stock-card {
                              display: flex;
                              flex-wrap: wrap;
                              justify-content: space-between;
                          }
                          .stock-card .field {
                              flex: 1 1 30%;
                              margin-bottom: 15px;
                          }
                      }
                  </style>
              </head>
              <body>
                  <h1>Bear11 Filtered Stocks</h1>
                  <div id="risk-input">
                      <label for="risk">Risk Per Trade: </label>
                      <input type="number" id="risk" min="1" value="${risk}" />
                      <button id="update-risk">Update Risk</button>
                  </div>
                  <div id="stock-container">
          `;

    data.forEach((item) => {
      const tradeQty = Math.floor(risk / item.trade_window);

      html += `
                <div class="stock-card">
                    <div class="field"><span class="label">Date:</span> ${new Date(
                      item.date
                    ).toLocaleDateString()}</div>
                    <div class="field"><span class="label">Symbol:</span> ${
                      item.symbol
                    }</div>
                    <div class="field"><span class="label">Is Green:</span> ${
                      item.is_green ? "Yes" : "No"
                    }</div>
                    <div class="field"><span class="label">Trade Window:</span> ${
                      item.trade_window
                    }</div>
                    <div class="field"><span class="label">First Candle High:</span> ${
                      item.first_candle_high
                    }</div>
                    <div class="field"><span class="label">First Candle Low:</span> ${
                      item.first_candle_low
                    }</div>
                    <div class="field"><span class="label">Tradable Quantity:</span> ${tradeQty}</div>
                </div>
            `;
    });

    html += `
                  </div>
                  <script>
                      const riskInput = document.getElementById('risk');
                      const storedRisk = localStorage.getItem('risk') || 1000;
                      const urlParams = new URLSearchParams(window.location.search);
                      
                      riskInput.value = storedRisk;
  
                      if (storedRisk && !urlParams.has('risk')) {
                          const userToken = urlParams.get('s');
                          window.location.href = window.location.pathname + '?s=' + userToken + '&risk=' + storedRisk;
                      }
  
                      document.getElementById('update-risk').addEventListener('click', function() {
                          const riskValue = riskInput.value;
                          if (riskValue > 1) {
                              localStorage.setItem('risk', riskValue);
                              window.location.href = window.location.pathname + '?s=${userToken}&risk=' + riskValue;
                          } else {
                              alert('Please enter a valid risk value greater than 1.');
                          }
                      });
                  </script>
              </body>
              </html>
          `;

    res.send(html);
  } catch (err) {
    console.error("Error", err);
    res.status(500).send("Internal Server Error");
  }
});

let lastApiHit = "";

const hitApi = async () => {
  try {
    await axios.get(
      `https://bear11-2lec.onrender.com/?s=${process.env.ADMIN_SECRET}`
    );
    lastApiHit = new Date();
  } catch (error) {
    console.error("Error making API call");
  }
};

setInterval(hitApi, 1 * 60 * 1000);

hitApi();

app.get("/hit/log", async (req, res) => {
  const istTime = lastApiHit.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  res.status(200).send("Last API hit made on : " + istTime);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
