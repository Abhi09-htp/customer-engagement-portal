// server/test-index.js - MINIMAL TEST
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// SUPER SIMPLE ROUTES (NO DATABASE)
app.get("/", (req, res) => {
  console.log("✅ Root route called");
  res.json({ message: "API IS WORKING - NO DATABASE" });
});

app.get("/test", (req, res) => {
  console.log("✅ Test route called");
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Start server - SIMPLE VERSION
app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log("🚀 MINIMAL SERVER STARTING...");
  console.log(`✅ Listening on port: ${PORT}`);
  console.log(`✅ Time: ${new Date().toISOString()}`);
  console.log("=".repeat(50));
});

// Catch unhandled errors
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err.message);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 UNHANDLED REJECTION at:", promise, "reason:", reason);
});