const express = require("express");

const app = express();
const PORT = 3000;

// basic route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Customer Engagement Portal"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
