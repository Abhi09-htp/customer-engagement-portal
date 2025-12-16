const express = require("express");

const app = express();
const PORT = 3000;

// middleware
app.use(express.json());

// shared in-memory data
let customers = [
  { id: 1, name: "Amit Sharma", email: "amit@example.com" },
  { id: 2, name: "Neha Verma", email: "neha@example.com" },
  { id: 3, name: "Rahul Mehta", email: "rahul@example.com" }
];

// home route
app.get("/", (req, res) => {
  res.json({
    message: "Customer Engagement Portal API"
  });
});

// GET customers
app.get("/customers", (req, res) => {
  res.json(customers);
});

// POST customer
app.post("/customers", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  const newCustomer = {
    id: customers.length + 1,
    name,
    email
  };

  customers.push(newCustomer);

  res.status(201).json({
    message: "Customer added successfully",
    customer: newCustomer
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
