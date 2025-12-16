import React, { useEffect, useState } from "react";

function App() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const fetchCustomers = () => {
    fetch("http://localhost:3000/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch(() => setMessage("Failed to load customers"));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
