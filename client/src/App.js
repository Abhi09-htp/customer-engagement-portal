import React, { useEffect, useState } from "react";

function App() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const fetchCustomers = async () => {
    const res = await fetch("http://localhost:3000/customers");
    const data = await res.json();
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

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
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    await fetch(`http://localhost:3000/customers/${id}`, {
      method: "DELETE"
    });

    setMessage("Customer deleted successfully");
    fetchCustomers();
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditEmail(c.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    const res = await fetch(`http://localhost:3000/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, email: editEmail })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message);
      return;
    }

    setMessage("Customer updated successfully");
    cancelEdit();
    fetchCustomers();
  };

  return (
    <div style={{
      maxWidth: "700px",
      margin: "40px auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontFamily: "Arial"
    }}>
      <h1 style={{ textAlign: "center" }}>Customer Engagement Portal</h1>

      <h3>Add Customer</h3>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", padding: "8px" }}
        />
        <br /><br />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "8px" }}
        />
        <br /><br />
        <button style={{ padding: "8px 16px" }}>Add Customer</button>
      </form>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}

      <hr />

      <h3>Customers</h3>

      {customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        <ul style={{ paddingLeft: "0", listStyle: "none" }}>
          {customers.map((c) => (
            <li key={c.id} style={{ marginBottom: "10px" }}>
              {editingId === c.id ? (
                <>
                  <input value={editName}
                    onChange={(e) => setEditName(e.target.value)} />
                  <input value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    style={{ marginLeft: "5px" }} />
                  <button onClick={() => saveEdit(c.id)}>Save</button>
                  <button onClick={cancelEdit} style={{ marginLeft: "5px" }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <strong>{c.name}</strong> — {c.email}
                  <button onClick={() => startEdit(c)} style={{ marginLeft: "10px" }}>
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCustomer(c.id)}
                    style={{
                      marginLeft: "5px",
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "4px 8px"
                    }}>
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
