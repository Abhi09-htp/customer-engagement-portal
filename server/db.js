// server/db.js - UPDATED with immediate connection test
const { Pool } = require('pg');

console.log('🔍 Step 1: Starting database connection setup...');

// Get the database URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log('❌ ERROR: DATABASE_URL is empty!');
} else {
  // Hide password in logs
  const safeUrl = connectionString.replace(/:([^:]+)@/, ':****@');
  console.log('✅ Step 2: DATABASE_URL found:', safeUrl);
}

// Create database connection with SSL
const pool = new Pool({
  connectionString: connectionString,
  
  // ⚠️ CRITICAL FOR RAILWAY - MUST BE EXACTLY THIS:
  ssl: {
    rejectUnauthorized: false
  }
});

// ⚠️ IMPORTANT: Test connection IMMEDIATELY when server starts
console.log('🔍 Step 3: Testing database connection now...');

pool.connect()
  .then((client) => {
    console.log('🎉 Step 4: SUCCESS! Connected to PostgreSQL database');
    
    // Test a simple query
    return client.query('SELECT NOW() as current_time')
      .then((result) => {
        console.log('🕐 Step 5: Database time is:', result.rows[0].current_time);
        client.release(); // Return client to pool
      })
      .catch((queryErr) => {
        console.error('❌ Step 5: Query failed:', queryErr.message);
        client.release();
      });
  })
  .catch((connectErr) => {
    console.error('❌ Step 4: CONNECTION FAILED! Error:', connectErr.message);
    console.error('Full error details:', connectErr);
  });

// Export for use in index.js
module.exports = pool;