import React from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export default function Logout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const confirmLogout = () => {
    logout();
    toast.success("You have been logged out");
    navigate("/", { replace: true });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 200px)",
        animation: "fadeInUp 0.5s var(--ease-out)"
      }}
    >
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,255,0.08), transparent 70%)", top: "20%", left: "10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)", bottom: "20%", right: "15%", pointerEvents: "none" }} />

      <section
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
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              margin: "0 auto 16px",
              background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              boxShadow: "0 4px 20px var(--accent-glow)"
            }}
          >
            P
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem" }}>Log out</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            Are you sure you want to sign out of your Phantom Store account?
          </p>
        </div>

        <div
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
            fontSize: "0.9375rem"
          }}
        >
          Signed in as <strong style={{ color: "var(--text-primary)" }}>{user.email}</strong>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ justifyContent: "center", padding: "14px", fontSize: "0.9375rem", marginTop: 8 }}
          onClick={confirmLogout}
        >
          Confirm logout
        </button>

        <Link
          to="/"
          className="btn btn-secondary"
          style={{ justifyContent: "center", padding: "14px", fontSize: "0.9375rem" }}
        >
          Cancel
        </Link>
      </section>
    </div>
  );
}
