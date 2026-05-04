import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useCartStore } from "../store/cartStore.js";
import { useAuthStore } from "../store/authStore.js";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { token } = useAuthStore();

  const checkout = async () => {
    if (!token) { navigate("/login"); return; }

    const payment = await api.post("/payment/create-payment-intent", {
      amount: Math.round(total() * 100),
      currency: "usd"
    });

    await api.post("/orders", {
      stripePaymentId: payment.data.paymentIntentId,
      items: items.map((item) => ({ productId: item._id, quantity: item.quantity }))
    });

    clearCart();
    navigate("/confirmed");
  };

  return (
    <section style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-xl)",
      paddingTop: "var(--space-2xl)",
      animation: "fadeInUp 0.4s var(--ease-out)"
    }}>
      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="badge badge-accent">Cart ✓</span>
        <div style={{ width: 40, height: 2, background: "var(--accent)" }} />
        <span className="badge badge-accent" style={{ background: "var(--accent)", color: "#fff" }}>Checkout</span>
        <div style={{ width: 40, height: 2, background: "var(--border-light)" }} />
        <span className="badge" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>Confirmed</span>
      </div>

      <div className="glass-strong" style={{
        width: "100%",
        maxWidth: 500,
        padding: "var(--space-xl)",
        display: "grid",
        gap: "var(--space-lg)",
        textAlign: "center"
      }}>
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: "1.5rem" }}>Order Summary</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            {items.length} item{items.length !== 1 ? "s" : ""} ready for purchase
          </p>
        </div>

        <div style={{
          padding: "var(--space-lg)",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)"
        }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", margin: "0 0 4px" }}>Total due</p>
          <p style={{
            fontSize: "2rem", fontWeight: 800, margin: 0,
            background: "linear-gradient(135deg, var(--accent-light), #818cf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            ${total().toFixed(2)}
          </p>
        </div>

        <button
          className="btn btn-primary"
          disabled={!items.length}
          onClick={checkout}
          style={{ justifyContent: "center", padding: "14px 28px", fontSize: "1rem" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Confirm & Pay
        </button>

        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.75rem" }}>
          Secured by Stripe · 256-bit encryption
        </p>
      </div>
    </section>
  );
}
