const express = require("express");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());

// home route
app.get("/", (req, res) => {
  res.json({ message: "Customer Engagement Portal API" });
});

// GET customers from PostgreSQL
app.get("/customers", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM customers ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /customers error:", err.message);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// POST customer into PostgreSQL
app.post("/customers", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );

    res.status(201).json({
      message: "Customer added successfully",
      customer: result.rows[0]
    });
  } catch (err) {
    console.error("POST /customers error:", err.message);

    // duplicate email error (PostgreSQL)
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Customer with this email already exists"
      });
    }

    res.status(500).json({
      message: "Failed to add customer"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
