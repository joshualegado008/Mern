import React, { useState, useEffect } from "react";
import "./MERNApp.css";

function MERNApp() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://localhost:5000/api/users";

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUsers(data);
      setError("");
    } catch (err) {
      setError(
        "Unable to connect to server. Make sure backend is running on port 5000."
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (editingUser) {
        const response = await fetch(`${API_URL}/${editingUser._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Failed to update user");
        setSuccess("User updated successfully!");
        setEditingUser(null);
      } else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Failed to add user");
        setSuccess("User added successfully!");
      }

      setFormData({ name: "", email: "", role: "" });
      setTimeout(() => fetchUsers(), 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete user");
      setSuccess("User deleted successfully!");
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.message);
      fetchUsers();
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "" });
  };

  return (
    <div className="container">
      <div className="wrapper">
        <div className="header">
          <h1 className="title">Work User Manager</h1>
          <p className="subtitle">Manage your team</p>
        </div>

        {error && (
          <div className="alert error-alert">
            <span className="icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert success-alert">
            <span className="icon">✓</span>
            <span>{success}</span>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <div className="icon-box">
              <span>{editingUser ? "✏️" : "➕"}</span>
            </div>
            <h2 className="card-title">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
          </div>

          <div className="form-group">
            <label className="label">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Joshua L. Cordero"
              value={formData.name}
              onChange={handleChange}
              className="input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">Role</label>
            <input
              type="text"
              name="role"
              placeholder="Administrator, Developer, etc."
              value={formData.role}
              onChange={handleChange}
              className="input"
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="button primary"
            >
              {loading
                ? "⏳ Processing..."
                : editingUser
                ? "💾 Update User"
                : "➕ Add User"}
            </button>

            {editingUser && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="button secondary"
              >
                ✕ Cancel
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="stats-bar">
            <div className="card-header">
              <div className="icon-box">
                <span>👥</span>
              </div>
              <h2 className="card-title">Team Members</h2>
            </div>
            <div className="badge">
              {users.length} {users.length === 1 ? "Member" : "Members"}
            </div>
          </div>

          {users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">No team members yet</p>
              <p className="empty-subtext">
                Add your first member to get started
              </p>
            </div>
          ) : (
            <div>
              {users.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-info">
                    <div className="avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <h3 className="user-name">{user.name}</h3>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="role-badge">{user.role}</div>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(user)}
                      disabled={loading}
                      className="edit-button"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={loading}
                      className="delete-button"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="footer">
          <p>Built with MongoDB • Express • React • Node.js</p>
        </div>
      </div>
    </div>
  );
}

export default MERNApp;
