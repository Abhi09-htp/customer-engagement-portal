const express = require("express");

const app = express();
const PORT = 3000;

// middleware
app.use(express.json());

// home route
app.get("/", (req, res) => {
  res.json({
    message: "Customer Engagement Portal API"
  });
});

// customers route
app.get("/customers", (req, res) => {
  const customers = [
    { id: 1, name: "Amit Sharma", email: "amit@example.com" },
    { id: 2, name: "Neha Verma", email: "neha@example.com" },
    { id: 3, name: "Rahul Mehta", email: "rahul@example.com" }
  ];

  res.json(customers);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
