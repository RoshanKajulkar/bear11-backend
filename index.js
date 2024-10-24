require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
const axios = require("axios");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

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

function encrypt(text) {
  if (text) {
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
      Buffer.from(process.env.ENCRYPTION_IV, "hex")
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }
  return "";
}

function decrypt(encryptedText) {
  if (encryptedText) {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
      Buffer.from(process.env.ENCRYPTION_IV, "hex")
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  return "";
}

function getSha256Hash(data) {
  if (data) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  return "";
}

app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("/logo", (req, res) => {
  res.sendFile(path.join(__dirname, "public/logo.png"));
});

app.post("/register", async (req, res) => {
  const { username, fyers_id, app_id, secret_id, password } = req.body;

  const saltRounds = Number(process.env.SALT);
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  let fyersId = null;
  if (fyers_id) {
    fyersId = fyers_id;
  }

  let appId = null;
  if (app_id) {
    appId = encrypt(app_id);
  }

  let secretId = null;
  if (secret_id) {
    secretId = encrypt(secret_id);
  }

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "username and password are required." });
  }

  try {
    const query = `
      INSERT INTO dashboard_user (username, fyers_id, app_id, secret_id, password)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const values = [username, fyersId, appId, secretId, hashedPassword];

    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const result = await pool.query(
      "SELECT password FROM dashboard_user WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const hashedPassword = result.rows[0].password;

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "22h" });

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/filtered-stocks", authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM market_data WHERE date = CURRENT_DATE;"
    );

    const data = result.rows;

    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Internal server error" });
  }
});

const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);

    if (decoded && decoded.exp) {
      const expiryDate = new Date(decoded.exp * 1000);
      const currentDate = new Date();

      if (currentDate > expiryDate) {
        // logger.error("Token expired!");
      }

      return expiryDate;
    }

    return "Token does not have an expiry date or is invalid.";
  } catch (error) {
    return "Token does not have an expiry date or is invalid.";
  }
};

app.get("/user", authenticateJWT, async (req, res) => {
  try {
    // console.log(req.user);
    const result = await pool.query(
      `SELECT * FROM dashboard_user WHERE username = '${req.user.username}';`
    );
    console.log(result.rows[0]);

    const appId = decrypt(result.rows[0].app_id);
    const accessToken = decrypt(result.rows[0].access_token);
    const refreshToken = decrypt(result.rows[0].refresh_token);
    console.log(getTokenExpiry(accessToken));
    // const data = result.rows;
    const secretId = decrypt(result.rows[0].secret_id);

    const appIdHash = getSha256Hash(`${appId}:${secretId}`);

    return res.json({
      username: result.rows[0].username,
      appId,
      accessTokenExp: getTokenExpiry(accessToken),
      refreshTokenExp: getTokenExpiry(refreshToken),
      refreshToken: refreshToken,
      appIdHash,
      isAdmin: result.rows[0].isadmin,
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Internal server error" });
  }
});

app.post("/getToken", authenticateJWT, async (req, res) => {
  try {
    console.log(req.body.auth_code);

    const result = await pool.query(
      `SELECT * FROM dashboard_user WHERE username = '${req.user.username}';`
    );

    console.log(result.rows[0]);
    const appId = decrypt(result.rows[0].app_id);
    const secretId = decrypt(result.rows[0].secret_id);

    const appIdHash = getSha256Hash(`${appId}:${secretId}`);
    // const result = await pool.query(
    //   `SELECT * FROM dashboard_user WHERE username = '${req.user.username}';`
    // );
    // console.log(result.rows[0]);

    // const appId = decrypt(result.rows[0].app_id);
    // // const data = result.rows;

    const tokenRes = await axios.post(
      "https://api-t1.fyers.in/api/v3/validate-authcode",
      {
        grant_type: "authorization_code",
        appIdHash: appIdHash,
        code: req.body.auth_code,
      }
    );

    console.log(tokenRes.data.access_token, tokenRes.data.refresh_token);

    const insertResult = await pool.query(
      `UPDATE dashboard_user
       SET access_token = $1,
           refresh_token = $2
       WHERE username = $3`,
      [
        encrypt(tokenRes.data.access_token),
        encrypt(tokenRes.data.refresh_token),
        req.user.username,
      ]
    );

    return res.json({ msg: "inwork" });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Internal server error" });
  }
});

let lastApiHit = "";

const hitApi = async () => {
  try {
    await axios.get(`https://bear11-2lec.onrender.com`);

    await axios.get(`https://indistockpulse.onrender.com`);
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
