import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { useCartStore } from "../store/cartStore.js";

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 20,
  borderBottom: "1px solid #222834"
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

export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore();
  const items = useCartStore((state) => (Array.isArray(state.items) ? state.items : []));
  const cartCount = useCartStore((state) =>
    (Array.isArray(state.items) ? state.items : []).reduce(
      (sum, item) => sum + (item.qty ?? item.quantity ?? 1),
      0
    )
  );

  return (
    <header style={headerStyle}>
      <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 22 }}>
        Phantom Store
      </Link>
      <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link to="/cart" style={{ color: "#d8e1ff" }}>
          Cart ({cartCount})
        </Link>
        {isAdmin() && (
          <Link to="/admin" style={{ color: "#d8e1ff" }}>
            Admin
          </Link>
        )}
        {user ? (
          <button onClick={logout} style={buttonStyle}>
            Logout
          </button>
        ) : (
          <Link to="/login" style={{ color: "#d8e1ff" }}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
