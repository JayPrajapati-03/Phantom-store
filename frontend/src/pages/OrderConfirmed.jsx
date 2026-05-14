import React from "react";
import { Link } from "react-router-dom";

export default function OrderConfirmed() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 240px)",
        gap: "var(--space-lg)",
        animation: "fadeInUp 0.5s var(--ease-out)",
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--success), #059669)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(52, 211, 153, 0.3)",
          animation: "scaleCheck 0.6s var(--ease-spring)"
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div style={{ position: "absolute", pointerEvents: "none", opacity: 0.15 }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i % 2 === 0 ? "var(--accent)" : "var(--success)",
              top: Math.sin(i * 0.8) * 100,
              left: Math.cos(i * 0.8) * 120,
              animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      <div>
        <h1 style={{ margin: "0 0 8px" }}>Order Confirmed!</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "1.1rem", maxWidth: 400 }}>
          Your Phantom Store order is being processed. You can review it anytime in your order history.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        <Link to="/orders" className="btn btn-primary" style={{ padding: "14px 28px" }}>
          View Past Orders
        </Link>
        <Link to="/" className="btn btn-secondary" style={{ padding: "14px 28px" }}>
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
