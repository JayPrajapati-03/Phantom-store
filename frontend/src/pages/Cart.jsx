import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore.js";
import { useAuthStore } from "../store/authStore.js";
import { getProductImageSrc, handleImageError } from "../utils/productImages.js";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const items = useCartStore((state) => (Array.isArray(state.items) ? state.items : []));
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQty = useCartStore((state) => state.updateQty);
  const total = useCartStore((state) => state.total);

  if (!user || user.role !== "customer") {
    return <Navigate to="/login" replace />;
  }

  return (
    <section style={{ display: "grid", gap: "var(--space-xl)", animation: "fadeInUp 0.4s var(--ease-out)" }}>
      <div>
        <h1 style={{ marginBottom: 4 }}>Shopping Cart</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
          {items.length ? `${items.length} item${items.length > 1 ? "s" : ""} in your cart` : ""}
        </p>
      </div>

      {!items.length && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-3xl) var(--space-lg)",
          gap: 16,
          color: "var(--text-muted)"
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Your cart is empty</p>
          <p style={{ fontSize: "0.875rem" }}>Add some products to get started</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>Browse Products</Link>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item._id}
              className="glass"
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr auto auto",
                gap: "var(--space-md)",
                padding: "var(--space-md)",
                alignItems: "center"
              }}
            >
              <img
                src={getProductImageSrc(item)}
                alt={item.name}
                style={{ width: 72, height: 54, objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                onError={handleImageError}
              />
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                <p style={{ margin: 0, color: "var(--accent-light)", fontWeight: 600, fontSize: "0.9375rem" }}>
                  ${Number(item.price).toFixed(2)}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ width: 32, height: 32, fontSize: "1rem" }}
                  onClick={() => updateQty(item._id, Math.max(1, item.quantity - 1))}
                >−</button>
                <span style={{ minWidth: 28, textAlign: "center", fontWeight: 600 }}>{item.quantity}</span>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ width: 32, height: 32, fontSize: "1rem" }}
                  onClick={() => updateQty(item._id, item.quantity + 1)}
                >+</button>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => removeItem(item._id)}
                style={{ color: "var(--error)", padding: 8 }}
                title="Remove item"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div
          className="glass-strong"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-lg)",
            flexWrap: "wrap",
            gap: "var(--space-md)"
          }}
        >
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0 0 4px" }}>Subtotal</p>
            <p style={{
              fontSize: "1.5rem", fontWeight: 800, margin: 0,
              background: "linear-gradient(135deg, var(--accent-light), #818cf8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              ${total().toFixed(2)}
            </p>
          </div>
          {user ? (
            <Link to="/checkout" className="btn btn-primary" style={{ padding: "14px 28px" }}>
              Proceed to Checkout →
            </Link>
          ) : (
            <button className="btn btn-primary" style={{ padding: "14px 28px" }} onClick={() => navigate("/login")}>
              Login to Checkout
            </button>
          )}
        </div>
      )}
    </section>
  );
}
