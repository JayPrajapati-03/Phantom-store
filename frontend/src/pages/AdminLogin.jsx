import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuthStore } from "../store/authStore.js";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/auth/login", form);
      const { user, token } = res.data;

      if (user.role !== "admin") {
        toast.error("Access denied. Admin credentials required.");
        setBusy(false);
        return;
      }

      login(user, token);
      navigate("/admin");
    } catch {
      setBusy(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 200px)",
      animation: "fadeInUp 0.5s var(--ease-out)"
    }}>
      {/* Background orbs — admin themed (orange/amber) */}
      <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.07), transparent 70%)", top: "15%", right: "10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,179,8,0.05), transparent 70%)", bottom: "20%", left: "12%", pointerEvents: "none" }} />

      <form
        onSubmit={submit}
        className="glass-strong"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "var(--space-xl)",
          display: "grid",
          gap: "var(--space-md)",
          position: "relative"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          {/* Admin shield icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(249,115,22,0.3)"
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem" }}>Admin Access</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            Sign in with your admin credentials
          </p>
        </div>

        {/* Admin notice badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: "var(--radius-sm)",
          background: "rgba(249, 115, 22, 0.08)",
          border: "1px solid rgba(249, 115, 22, 0.15)",
          fontSize: "0.8125rem",
          color: "#fb923c"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Restricted area — authorized personnel only
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>Admin Email</label>
          <div style={{ position: "relative" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              className="input"
              type="email"
              placeholder="admin@phantomstore.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ paddingLeft: 42 }}
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
          <div style={{ position: "relative" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ paddingLeft: 42 }}
              required
            />
          </div>
        </div>

        <button
          className="btn"
          style={{
            justifyContent: "center",
            padding: "14px",
            fontSize: "0.9375rem",
            marginTop: 8,
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 12px rgba(249,115,22,0.3)"
          }}
          disabled={busy}
        >
          {busy ? (
            "Authenticating..."
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Access Admin Panel
            </>
          )}
        </button>

        <p style={{ margin: 0, textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          Not an admin?{" "}
          <a href="/login" style={{ color: "var(--accent-light)", textDecoration: "underline" }}>
            Go to customer login
          </a>
        </p>
      </form>
    </div>
  );
}
