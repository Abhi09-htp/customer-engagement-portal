// server/db.js - SIMPLE VERSION (No connection test on startup)
const { Pool } = require('pg');

console.log('🔧 Creating database connection pool...');

// Get the database URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log('❌ FATAL: DATABASE_URL is empty!');
  process.exit(1); // Stop the app if no database URL
}

// Create database connection with SSL
const pool = new Pool({
  connectionString: connectionString,
  
  // ⚠️ CRITICAL FOR RAILWAY:
  ssl: {
    rejectUnauthorized: false
  }
});

// Log when clients connect (for debugging)
pool.on('connect', () => {
  console.log('✅ New database client connected');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

console.log('✅ Database pool created successfully');

// Export for use in index.js
module.exports = pool;