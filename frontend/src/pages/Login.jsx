import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuthStore } from "../store/authStore.js";

const inputStyle = {
  width: "100%",
  border: "1px solid #2a3346",
  borderRadius: 6,
  background: "#111722",
  color: "#fff",
  padding: "12px 14px"
};

const buttonStyle = {
  border: "0",
  borderRadius: 10,
  background: "#7c5cff",
  color: "#fff",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700
};

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    const res = await api.post("/auth/login", form);
    login(res.data.user, res.data.token);
    navigate("/");
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 420, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Login</h1>
      <input
        style={inputStyle}
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
      />
      <input
        style={inputStyle}
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
      />
      <button style={buttonStyle}>Login</button>
    </form>
  );
}
