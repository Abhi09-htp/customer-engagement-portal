import React, { useEffect, useState } from "react";

function App() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:3000/customers");
      const data = await res.json();
      setCustomers(data);
    } catch {
      setMessage("Failed to load customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Add customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Customer added successfully");
      setName("");
      setEmail("");
      fetchCustomers();
    } catch {
      setMessage("Server error");
    }
  };

  // Delete customer
  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/customers/${id}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Customer deleted successfully");
      fetchCustomers();
    } catch {
      setMessage("Server error");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Customer Engagement Portal</h1>

      <h2>Add Customer</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Add Customer</button>
      </form>

      {message && <p>{message}</p>}

      <h2>Customers</h2>

      {customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        <ul>
          {customers.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong> — {c.email}
              <button
                style={{
                  marginLeft: "10px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  cursor: "pointer"
                }}
                onClick={() => deleteCustomer(c.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
