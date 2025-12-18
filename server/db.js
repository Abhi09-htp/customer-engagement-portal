// server/db.js - UPDATED VERSION
// This file creates the connection to PostgreSQL database

const { Pool } = require('pg');

console.log('🔍 DEBUG: Starting database connection setup...');

// Get the database URL from Railway's environment variable
const connectionString = process.env.DATABASE_URL;

// Log part of the URL (but hide password for security)
if (connectionString) {
  const safeUrl = connectionString.replace(/:[^:]*@/, ':****@');
  console.log('🔍 DEBUG: DATABASE_URL found (partial):', safeUrl);
} else {
  console.log('❌ ERROR: DATABASE_URL is empty or not found!');
}

// Create the database connection pool
const pool = new Pool({
  connectionString: connectionString,
  
  // ⚠️ CRITICAL FOR RAILWAY: This enables SSL (secure connection)
  ssl: {
    rejectUnauthorized: false  // Allows Railway's self-signed certificate
  }
});

// Test the connection when server starts
pool.on('connect', () => {
  console.log('✅ SUCCESS: Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ FATAL: Database connection error:', err.message);
  console.error('❌ Error details:', err);
});

module.exports = pool;