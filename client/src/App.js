import React, { useEffect, useState } from "react";

function App() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/customers")
      .then((response) => response.json())
      .then((data) => setCustomers(data))
      .catch((error) =>
        console.error("Error fetching customers:", error)
      );
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Customer Engagement Portal</h1>

      <h2>Customers</h2>

      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <ul>
          {customers.map((customer) => (
            <li key={customer.id}>
              <strong>{customer.name}</strong> — {customer.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

