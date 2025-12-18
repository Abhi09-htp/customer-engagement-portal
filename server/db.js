// server/db.js - BULLETPROOF VERSION
const { Pool } = require('pg');

console.log('🚀 STEP 1: Loading database configuration...');

// Try to load dotenv, but don't crash if it fails
try {
  require('dotenv').config();
  console.log('✅ dotenv loaded (for local development)');
} catch (dotenvError) {
  console.log('⚠️ dotenv not available (OK in production)');
}

// Get database URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ FATAL ERROR: DATABASE_URL is not set!');
  console.error('Please check Railway environment variables.');
  process.exit(1); // Exit gracefully with error code
}

console.log('✅ STEP 2: DATABASE_URL found (starting with):', 
  connectionString.substring(0, 50) + '...');

// Create pool with SSL for Railway
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Log connection events
pool.on('connect', () => {
  console.log('✅ New database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  // Don't crash - just log the error
});

console.log('✅ STEP 3: Database connection pool created');

module.exports = pool;