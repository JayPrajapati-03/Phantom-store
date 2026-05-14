import React from "react";
import { panelStyle } from "../admin/adminStyles.js";

const statBlock = (label, value, accentColor, icon) => (
  <div
    style={{
      display: "grid",
      gap: 10,
      padding: 22,
      borderRadius: 20,
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-light)",
      transition: "all 0.2s ease"
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: accentColor, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
        {label}
      </span>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <strong style={{ fontSize: 34 }}>{value}</strong>
  </div>
);

export default function MerchantDashboardView({
  user,
  stores,
  products,
  activeStore,
  totalInventoryValue,
  lowStockCount,
  setActiveView
}) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          ...panelStyle,
          padding: 32,
          background: "var(--bg-surface)",
          borderImage: "none"
        }}
      >
        <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--accent-light)", fontSize: 12, fontWeight: 700 }}>
            Merchant workspace
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.3rem)", lineHeight: 1.02 }}>
            Welcome back, {user?.name || "Merchant"}.
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", maxWidth: 620 }}>
            Manage your storefront and product catalog from the same dashboard layout used in admin.
          </p>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        {statBlock("Stores", stores.length, "var(--success)", "ST")}
        {statBlock("Products", products.length, "var(--accent-light)", "PR")}
        {statBlock("Low Stock", lowStockCount, "var(--warning)", "LS")}
        {statBlock("Active Store", activeStore?.name || "None", "var(--accent)", "AC")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {statBlock("Inventory Value", `$${totalInventoryValue.toFixed(0)}`, "var(--success)", "$")}
        {statBlock("Catalog Ready", products.length ? "Yes" : "No", "var(--accent-light)", "OK")}
      </div>

      <section style={{ ...panelStyle, padding: 24 }}>
        <p style={{ margin: 0, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12, marginBottom: 12, fontWeight: 700 }}>
          Quick actions
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { label: "Manage Store", icon: "ST", view: "store", desc: "Create or review your storefront" },
            { label: "Add Product", icon: "PR", view: "products", desc: "Upload and edit your catalog" }
          ].map((action) => (
            <button
              key={action.view}
              type="button"
              onClick={() => setActiveView(action.view)}
              style={{
                border: "1px solid var(--border-light)",
                borderRadius: 18,
                background: "var(--bg-elevated)",
                padding: 20,
                cursor: "pointer",
                color: "inherit",
                textAlign: "left",
                display: "grid",
                gap: 8,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor = "var(--border-focus)";
                event.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor = "var(--border-light)";
                event.currentTarget.style.transform = "none";
              }}
            >
              <span style={{ fontSize: 28 }}>{action.icon}</span>
              <strong style={{ fontSize: 16 }}>{action.label}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{action.desc}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
