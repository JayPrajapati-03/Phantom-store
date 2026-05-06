import React from "react";
import { panelStyle, cardStyle, inputStyle, labelStyle, formatStatus, getStatusStyle } from "./adminStyles.js";

export default function OrdersView({ orders, updateStatus }) {
  const pendingOrders = orders.filter((o) => ["pending", "paid", "processing"].includes(o.status));
  const completedOrders = orders.filter((o) => ["shipped", "delivered"].includes(o.status));
  const otherOrders = orders.filter((o) => ["cancelled", "refunded"].includes(o.status));

  const renderOrder = (order) => {
    const s = getStatusStyle(order.status);
    return (
      <div key={order._id} style={{
        ...cardStyle, padding: 18, display: "grid", gap: 14,
        gridTemplateColumns: "minmax(0, 1.2fr) minmax(200px, 0.8fr)"
      }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <strong style={{ fontSize: 16 }}>Order {order._id.slice(-8).toUpperCase()}</strong>
            <span style={{ padding: "7px 11px", borderRadius: 999, background: s.bg, color: s.text, fontSize: 12, fontWeight: 800 }}>
              {formatStatus(order.status)}
            </span>
          </div>
          <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: 800 }}>${Number(order.total).toFixed(2)}</p>
          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
          </p>
        </div>
        <div style={{ display: "grid", alignContent: "start", gap: 8 }}>
          <label style={labelStyle}>Update status
            <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} style={inputStyle}>
              {["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"].map((st) => (
                <option key={st} value={st}>{formatStatus(st)}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{
        ...panelStyle, padding: 28,
        background: "var(--admin-hero-bg)"
      }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--status-pending-text)", fontSize: 12, fontWeight: 800 }}>Order management</p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>Keep fulfillment moving</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", maxWidth: 620, fontWeight: 600 }}>
            Track, update, and manage all customer orders from this page.
          </p>
        </div>
      </section>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Total", count: orders.length, color: "var(--text-accent)", bg: "rgba(93,139,255,0.16)" },
          { label: "Active", count: pendingOrders.length, color: "var(--status-pending-text)", bg: "rgba(250,204,21,0.14)" },
          { label: "Completed", count: completedOrders.length, color: "var(--status-delivered-text)", bg: "rgba(74,222,128,0.14)" },
          { label: "Cancelled/Refunded", count: otherOrders.length, color: "var(--status-cancelled-text)", bg: "rgba(248,113,113,0.14)" },
        ].map((s) => (
          <div key={s.label} style={{
            padding: 18, borderRadius: 18,
            "--metric-tint": s.bg,
            background: "var(--metric-card-bg)",
            border: "1px solid var(--border-light)", display: "grid", gap: 6,
            boxShadow: "var(--shadow-card)"
          }}>
            <span style={{ color: s.color, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>{s.label}</span>
            <strong style={{ fontSize: 30, color: "var(--text-primary)" }}>{s.count}</strong>
          </div>
        ))}
      </div>

      {/* Active Orders */}
      {pendingOrders.length > 0 && (
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, color: "var(--status-pending-text)" }}>⏳ Active Orders ({pendingOrders.length})</h2>
          {pendingOrders.map(renderOrder)}
        </section>
      )}

      {/* Completed */}
      {completedOrders.length > 0 && (
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, color: "var(--status-delivered-text)" }}>✅ Completed ({completedOrders.length})</h2>
          {completedOrders.map(renderOrder)}
        </section>
      )}

      {/* Other */}
      {otherOrders.length > 0 && (
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, color: "var(--status-cancelled-text)" }}>Cancelled / Refunded ({otherOrders.length})</h2>
          {otherOrders.map(renderOrder)}
        </section>
      )}

      {orders.length === 0 && (
        <section style={{ ...panelStyle, padding: 40, textAlign: "center" }}>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 16 }}>No orders yet.</p>
        </section>
      )}
    </div>
  );
}
