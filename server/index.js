const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// STEP 1: Basic middleware
// ============================================
app.use(cors({ origin: "*" }));
app.use(express.json());

// ============================================
// STEP 2: Import database (but don't test yet)
// ============================================
let pool;
try {
  pool = require("./db");
  console.log('✅ Database module loaded');
} catch (dbError) {
  console.error('❌ Failed to load database module:', dbError.message);
  process.exit(1);
}

// ============================================
// STEP 3: SIMPLE TEST ROUTE (no database)
// ============================================
app.get("/", (req, res) => {
  res.json({ 
    message: "Customer Engagement Portal API",
    status: "running",
    database: "unknown"
  });
});

// ============================================
// STEP 4: HEALTH CHECK (tests database)
// ============================================
app.get('/health', async (req, res) => {
  console.log('🩺 Health check requested');
  
  const healthReport = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    app: {
      port: PORT,
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    database: {
      connected: false,
      error: null
    }
  };

  try {
    // Test database with simple query
    const result = await pool.query('SELECT NOW() as time');
    healthReport.status = 'healthy';
    healthReport.database.connected = true;
    healthReport.database.time = result.rows[0].time;
    console.log('✅ Health check: Database is connected');
  } catch (error) {
    healthReport.status = 'unhealthy';
    healthReport.database.error = error.message;
    console.log('❌ Health check: Database error:', error.message);
  }

  res.json(healthReport);
});

// ============================================
// STEP 5: CUSTOMERS ROUTE (with error handling)
// ============================================
app.get("/customers", async (req, res) => {
  console.log('📋 GET /customers requested');
  
  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY id");
    console.log(`✅ Found ${result.rows.length} customers`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Database query failed:', err.message);
    res.status(500).json({ 
      message: "Failed to fetch customers",
      error: err.message 
    });
  }
});

// ============================================
// STEP 6: OTHER CRUD ROUTES (Keep your existing code)
// ============================================
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
    console.log(`✅ Added customer: ${result.rows[0].email}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error('❌ Failed to add customer:', err.message);
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
    console.log(`✅ Updated customer ID: ${id}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Failed to update customer:', err.message);
    res.status(500).json({ message: "Failed to update customer" });
  }
});

app.delete("/customers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM customers WHERE id=$1", [id]);
    console.log(`✅ Deleted customer ID: ${id}`);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error('❌ Failed to delete customer:', err.message);
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

// ============================================
// STEP 7: START SERVER (Last step!)
// ============================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ STEP 1: Server running on port ${PORT}`);
  console.log(`✅ STEP 2: Access via: http://0.0.0.0:${PORT}`);
  console.log(`✅ STEP 3: Try these endpoints:`);
  console.log(`   → https://customer-engagement-portal-production.up.railway.app/`);
  console.log(`   → https://customer-engagement-portal-production.up.railway.app/health`);
  console.log(`   → https://customer-engagement-portal-production.up.railway.app/customers`);
});