import React from "react";
import { panelStyle } from "./adminStyles.js";

const statBlock = (label, value, accent, icon) => (
  <div style={{
    display: "grid", gap: 10, padding: 22, borderRadius: 20,
    background: accent, border: "1px solid rgba(255,255,255,0.08)"
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#9bb5ec", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <strong style={{ fontSize: 34 }}>{value}</strong>
  </div>
);

export default function DashboardView({ products, orders, stores, merchants, totalInventoryValue, pendingOrders, setActiveView }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{
        ...panelStyle, padding: 32,
        background: "radial-gradient(circle at top right, rgba(93,139,255,0.22), transparent 32%), radial-gradient(circle at top left, rgba(138,92,255,0.2), transparent 26%), linear-gradient(180deg, rgba(16,21,31,0.96), rgba(11,14,22,0.98))"
      }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "#8ea7db", fontSize: 12 }}>Admin workspace</p>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.3rem)", lineHeight: 1.02 }}>Welcome to your control room.</h1>
          <p style={{ margin: 0, color: "#b8c4de", maxWidth: 620 }}>
            Manage merchants, stores, products, and orders — each from its own dedicated page.
          </p>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        {statBlock("Products", products.length, "linear-gradient(135deg, rgba(93,139,255,0.16), rgba(31,39,57,0.92))", "📦")}
        {statBlock("Merchants", merchants.length, "linear-gradient(135deg, rgba(138,92,255,0.16), rgba(31,39,57,0.92))", "👤")}
        {statBlock("Stores", stores.length, "linear-gradient(135deg, rgba(74,222,128,0.12), rgba(31,39,57,0.92))", "🏪")}
        {statBlock("Orders", orders.length, "linear-gradient(135deg, rgba(250,204,21,0.12), rgba(31,39,57,0.92))", "🛒")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {statBlock("Open Orders", pendingOrders, "linear-gradient(135deg, rgba(248,113,113,0.12), rgba(31,39,57,0.92))", "⏳")}
        {statBlock("Inventory Value", `$${totalInventoryValue.toFixed(0)}`, "linear-gradient(135deg, rgba(74,222,128,0.12), rgba(31,39,57,0.92))", "💰")}
      </div>

      <section style={{ ...panelStyle, padding: 24 }}>
        <p style={{ margin: 0, color: "#8ea7db", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12, marginBottom: 12 }}>Quick actions</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { label: "Create Merchant", icon: "👤", view: "merchants", desc: "Add new merchant accounts" },
            { label: "Create Store", icon: "🏪", view: "stores", desc: "Set up a new storefront" },
            { label: "Add Product", icon: "📦", view: "products", desc: "Upload AR-ready products" },
            { label: "Manage Orders", icon: "🛒", view: "orders", desc: "Track & update orders" },
          ].map((action) => (
            <button
              key={action.view}
              type="button"
              onClick={() => setActiveView(action.view)}
              style={{
                border: "1px solid rgba(92,111,150,0.2)", borderRadius: 18,
                background: "rgba(18,23,34,0.92)", padding: 20, cursor: "pointer",
                color: "inherit", textAlign: "left", display: "grid", gap: 8,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(136,167,255,0.45)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(92,111,150,0.2)"; e.currentTarget.style.transform = "none"; }}
            >
              <span style={{ fontSize: 28 }}>{action.icon}</span>
              <strong style={{ fontSize: 16 }}>{action.label}</strong>
              <span style={{ color: "#8ea0c2", fontSize: 13 }}>{action.desc}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
