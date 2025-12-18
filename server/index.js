const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ ALLOW VERCEL FRONTEND
app.use(cors({
  origin: "*", // allow all origins (safe for this project)
}));

app.use(express.json());

// Add this RIGHT AFTER: app.use(express.json());

// ============================================
// DIAGNOSTIC ROUTE - Helps us debug connection
// ============================================
app.get('/health', async (req, res) => {
  console.log('🩺 Health check called at:', new Date().toISOString());
  
  const healthReport = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    database: {
      connectionUrlExists: !!process.env.DATABASE_URL,
      connectionTest: 'pending',
      error: null
    }
  };

  try {
    // Try a simple query
    const result = await pool.query('SELECT NOW() as current_time');
    healthReport.status = 'healthy';
    healthReport.database.connectionTest = 'success';
    healthReport.database.currentTime = result.rows[0].current_time;
    console.log('✅ Health check: Database connected successfully');
  } catch (error) {
    healthReport.status = 'unhealthy';
    healthReport.database.connectionTest = 'failed';
    healthReport.database.error = {
      message: error.message,
      code: error.code || 'NO_CODE'
    };
    console.log('❌ Health check: Database connection failed:', error.message);
  }

  res.json(healthReport);
});

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Customer Engagement Portal API" });
});

// GET customers
app.get("/customers", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM customers ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// POST customer
app.post("/customers", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING *",
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

// PUT customer
app.put("/customers/:id", async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE customers SET name=$1, email=$2 WHERE id=$3 RETURNING *",
      [name, email, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update customer" });
  }
});

// DELETE customer
app.delete("/customers/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM customers WHERE id=$1", [id]);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
