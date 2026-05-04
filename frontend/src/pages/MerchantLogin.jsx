import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuthStore } from "../store/authStore.js";
import toast from "react-hot-toast";

export default function MerchantLogin() {
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

      if (user.role !== "merchant") {
        toast.error("Access denied. Merchant credentials required.");
        setBusy(false);
        return;
      }

      login(user, token);
      navigate("/merchant");
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
      {/* Background orbs — merchant themed (emerald) */}
      <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.07), transparent 70%)", top: "15%", right: "10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.05), transparent 70%)", bottom: "20%", left: "12%", pointerEvents: "none" }} />

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
          {/* Merchant store icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(16,185,129,0.3)"
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem" }}>Merchant Portal</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            Manage your store and products
          </p>
        </div>

        {/* Merchant notice badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: "var(--radius-sm)",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.15)",
          fontSize: "0.8125rem",
          color: "#34d399"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Merchant accounts — store owners only
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>Merchant Email</label>
          <div style={{ position: "relative" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              className="input"
              type="email"
              placeholder="merchant@phantomstore.com"
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
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 12px rgba(16,185,129,0.3)"
          }}
          disabled={busy}
        >
          {busy ? (
            "Authenticating..."
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Access Merchant Portal
            </>
          )}
        </button>

        <p style={{ margin: 0, textAlign: "center", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          Not a merchant?{" "}
          <a href="/login" style={{ color: "var(--accent-light)", textDecoration: "underline" }}>
            Go to customer login
          </a>
        </p>
      </form>
    </div>
  );
}
