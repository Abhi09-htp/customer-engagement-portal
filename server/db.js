const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "Abhi2595",
  database: "customer_portal",
  port: 5432
});

module.exports = pool;
