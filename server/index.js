const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

// ⚠️ CRITICAL: Use Railway's PORT, not a fixed one
const PORT = process.env.PORT || 3000;

// ⚠️ CRITICAL: Allow all origins for now (we'll secure later)
app.use(cors({ origin: "*" }));
app.use(express.json());

// ============================================
// DIAGNOSTIC ROUTE - Keep this for debugging
// ============================================
app.get('/health', async (req, res) => {
  console.log('🩺 Health check called at:', new Date().toISOString());
  
  const healthReport = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    app: {
      port: PORT,
      nodeEnv: process.env.NODE_ENV,
      databaseUrlPresent: !!process.env.DATABASE_URL
    },
    database: {
      connectionTest: 'pending',
      error: null
    }
  };

  try {
    const result = await pool.query('SELECT NOW() as current_time');
    healthReport.status = 'healthy';
    healthReport.database.connectionTest = 'success';
    healthReport.database.currentTime = result.rows[0].current_time;
    console.log('✅ Health check: Database connected');
  } catch (error) {
    healthReport.status = 'unhealthy';
    healthReport.database.connectionTest = 'failed';
    healthReport.database.error = error.message;
    console.log('❌ Health check: Database error:', error.message);
  }

  res.json(healthReport);
});

// ============================================
// YOUR EXISTING ROUTES (Keep these exactly as before)
// ============================================

app.get("/", (req, res) => {
  res.json({ message: "Customer Engagement Portal API" });
});

app.get("/customers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

app.post("/customers", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO customers (name, email) VALUES ($1,$2) RETURNING *",
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Failed to add customer" });
  }
});

app.put("/customers/:id", async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE customers SET name=$1, email=$2 WHERE id=$3 RETURNING *",
      [name, email, id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Failed to update customer" });
  }
});

app.delete("/customers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM customers WHERE id=$1", [id]);
    res.json({ message: "Customer deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

// ⚠️ CRITICAL: Listen on 0.0.0.0 (not localhost)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Access via: http://0.0.0.0:${PORT}`);
});