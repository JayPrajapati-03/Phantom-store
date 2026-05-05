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
          <p style={{ margin: 0, color: "#dce4f9", fontWeight: 700 }}>${Number(order.total).toFixed(2)}</p>
          <p style={{ margin: 0, color: "#aab6d0", lineHeight: 1.6 }}>
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
        background: "radial-gradient(circle at top right, rgba(250,204,21,0.15), transparent 32%), linear-gradient(180deg, rgba(16,21,31,0.96), rgba(11,14,22,0.98))"
      }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "#facc15", fontSize: 12 }}>Order management</p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>Keep fulfillment moving</h1>
          <p style={{ margin: 0, color: "#b8c4de", maxWidth: 620 }}>
            Track, update, and manage all customer orders from this page.
          </p>
        </div>
      </section>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Total", count: orders.length, color: "#9bb5ec", bg: "rgba(93,139,255,0.16)" },
          { label: "Active", count: pendingOrders.length, color: "#facc15", bg: "rgba(250,204,21,0.12)" },
          { label: "Completed", count: completedOrders.length, color: "#86efac", bg: "rgba(74,222,128,0.12)" },
          { label: "Cancelled/Refunded", count: otherOrders.length, color: "#fca5a5", bg: "rgba(248,113,113,0.12)" },
        ].map((s) => (
          <div key={s.label} style={{
            padding: 18, borderRadius: 18,
            background: `linear-gradient(135deg, ${s.bg}, rgba(31,39,57,0.92))`,
            border: "1px solid rgba(255,255,255,0.08)", display: "grid", gap: 6
          }}>
            <span style={{ color: s.color, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</span>
            <strong style={{ fontSize: 30 }}>{s.count}</strong>
          </div>
        ))}
      </div>

      {/* Active Orders */}
      {pendingOrders.length > 0 && (
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, color: "#facc15" }}>⏳ Active Orders ({pendingOrders.length})</h2>
          {pendingOrders.map(renderOrder)}
        </section>
      )}

      {/* Completed */}
      {completedOrders.length > 0 && (
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, color: "#86efac" }}>✅ Completed ({completedOrders.length})</h2>
          {completedOrders.map(renderOrder)}
        </section>
      )}

      {/* Other */}
      {otherOrders.length > 0 && (
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, color: "#fca5a5" }}>Cancelled / Refunded ({otherOrders.length})</h2>
          {otherOrders.map(renderOrder)}
        </section>
      )}

      {orders.length === 0 && (
        <section style={{ ...panelStyle, padding: 40, textAlign: "center" }}>
          <p style={{ margin: 0, color: "#8ea0c2", fontSize: 16 }}>No orders yet.</p>
        </section>
      )}
    </div>
  );
}
