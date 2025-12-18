// server/index.js - CRASH-PROOF VERSION
console.log('='.repeat(60));
console.log('🚀 Customer Engagement Portal API - STARTING');
console.log('='.repeat(60));

// Catch ALL unhandled errors
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION (CRITICAL):', error.message);
  console.error('Stack trace:', error.stack);
  // Don't exit - keep the process alive
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
});

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

console.log(`📡 STEP 1: Setting up server on port ${PORT}`);

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

console.log('✅ STEP 2: Express middleware configured');

// Load database - with try/catch
let pool;
try {
  pool = require("./db");
  console.log('✅ STEP 3: Database module loaded successfully');
} catch (dbError) {
  console.error('❌ STEP 3: Failed to load database module:', dbError.message);
  console.error('Full error:', dbError);
  // Create a mock pool that won't crash
  pool = {
    query: () => Promise.reject(new Error('Database not available'))
  };
}

// ============ ROUTES ============

// Root route - ALWAYS works (no database)
app.get("/", (req, res) => {
  console.log('✅ GET / - Root route called');
  res.json({ 
    message: "Customer Engagement Portal API",
    status: "online",
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Health check - tests database
app.get('/health', async (req, res) => {
  console.log('🩺 GET /health - Health check called');
  
  const report = {
    status: "checking",
    timestamp: new Date().toISOString(),
    app: { port: PORT, nodeEnv: process.env.NODE_ENV || 'development' },
    database: { connected: false, error: null }
  };

  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    report.status = "healthy";
    report.database.connected = true;
    report.database.time = result.rows[0].time;
    report.database.version = result.rows[0].version;
    console.log('✅ Health check: Database is connected');
  } catch (error) {
    report.status = "degraded";
    report.database.error = error.message;
    console.log('⚠️ Health check: Database error (but app still runs):', error.message);
  }

  res.json(report);
});

// Customers route
app.get("/customers", async (req, res) => {
  console.log('📋 GET /customers - Request received');
  
  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY id");
    console.log(`✅ Found ${result.rows.length} customer(s)`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Database query failed:', err.message);
    res.status(500).json({ 
      message: "Failed to fetch customers",
      error: err.message,
      hint: "Check Railway DATABASE_URL and SSL settings"
    });
  }
});

// Other routes (POST, PUT, DELETE) - keep your existing code but add logs
app.post("/customers", async (req, res) => {
  const { name, email } = req.body;
  console.log(`📝 POST /customers - Creating: ${name} (${email})`);
  
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO customers (name, email) VALUES ($1,$2) RETURNING *",
      [name, email]
    );
    console.log(`✅ Customer created: ${result.rows[0].email}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      console.log('⚠️ Email already exists:', email);
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error('❌ Failed to add customer:', err.message);
    res.status(500).json({ message: "Failed to add customer", error: err.message });
  }
});

// PUT and DELETE routes - add similar logging
app.put("/customers/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`✏️ PUT /customers/${id} - Updating`);
  // ... your existing PUT code with try/catch
});

app.delete("/customers/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ DELETE /customers/${id} - Deleting`);
  // ... your existing DELETE code with try/catch
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log('='.repeat(60));
  console.log(`✅ SERVER IS RUNNING ON PORT ${PORT}`);
  console.log(`✅ Local: http://localhost:${PORT}`);
  console.log(`✅ Network: http://0.0.0.0:${PORT}`);
  console.log(`✅ Railway: https://customer-engagement-portal-production.up.railway.app`);
  console.log('='.repeat(60));
  console.log('📋 Available routes:');
  console.log(`   GET  /               - API status`);
  console.log(`   GET  /health         - Database health check`);
  console.log(`   GET  /customers      - List all customers`);
  console.log(`   POST /customers      - Create new customer`);
  console.log(`   PUT  /customers/:id  - Update customer`);
  console.log(`   DELETE /customers/:id - Delete customer`);
  console.log('='.repeat(60));
});