const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

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

    // duplicate email error
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

// DELETE customer by id
app.delete("/customers/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM customers WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json({
      message: "Customer deleted successfully"
    });
  } catch (err) {
    console.error("DELETE /customers error:", err.message);
    res.status(500).json({
      message: "Failed to delete customer"
    });
  }
});

// UPDATE customer by id
app.put("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  try {
    const result = await pool.query(
      "UPDATE customers SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json({
      message: "Customer updated successfully",
      customer: result.rows[0]
    });
  } catch (err) {
    console.error("PUT /customers error:", err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    res.status(500).json({
      message: "Failed to update customer"
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
