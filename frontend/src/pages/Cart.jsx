import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore.js";
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
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-block"
};

const secondaryStyle = {
  ...buttonStyle,
  background: "#263044"
};

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const items = useCartStore((state) => (Array.isArray(state.items) ? state.items : []));
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQty = useCartStore((state) => state.updateQty);
  const total = useCartStore((state) => state.total);

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <h1 style={{ margin: 0 }}>Cart</h1>
      {!items.length && <p style={{ color: "#abb7ce" }}>Your cart is empty.</p>}
      {items.map((item) => (
        <div key={item._id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 110px 110px", gap: 12, padding: 14, borderBottom: "1px solid #222834" }}>
          <div>
            <p style={{ margin: "0 0 6px" }}>{item.name}</p>
            <p style={{ margin: 0, color: "#abb7ce" }}>${Number(item.price).toFixed(2)}</p>
          </div>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) => updateQty(item._id, Number(event.target.value))}
            style={inputStyle}
          />
          <button style={secondaryStyle} onClick={() => removeItem(item._id)}>
            Remove
          </button>
        </div>
      ))}
      <h2 style={{ margin: 0 }}>Subtotal: ${total().toFixed(2)}</h2>
      {user ? (
        <Link to="/checkout" style={buttonStyle}>
          Proceed to Checkout
        </Link>
      ) : (
        <button style={buttonStyle} onClick={() => navigate("/login")}>
          Login to Checkout
        </button>
      )}
    </section>
  );
}
