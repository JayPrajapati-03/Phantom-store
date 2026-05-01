import React from "react";
import { Link } from "react-router-dom";

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

export default function OrderConfirmed() {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Order confirmed</h1>
      <p style={{ color: "#abb7ce", margin: 0 }}>Your Phantom Store order is being processed.</p>
      <Link to="/" style={buttonStyle}>
        Continue shopping
      </Link>
    </section>
  );
}
