import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useAuthStore } from "../store/authStore.js";
import { handleImageError } from "../utils/productImages.js";

const statusColors = {
  pending: "var(--warning, #f59e0b)",
  paid: "var(--accent, #6366f1)",
  processing: "var(--accent-light, #818cf8)",
  shipped: "var(--info, #0ea5e9)",
  delivered: "var(--success, #10b981)",
  cancelled: "var(--error, #ef4444)",
  refunded: "var(--text-muted, #94a3b8)"
};

export default function Orders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders/my");
        if (!ignore) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(error.response?.data?.message || "Could not load your orders.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  if (!user || user.role !== "customer") {
    return <Navigate to="/login" replace />;
  }

  return (
    <section style={{ display: "grid", gap: "var(--space-xl)", animation: "fadeInUp 0.4s var(--ease-out)" }}>
      <div>
        <h1 style={{ marginBottom: 4 }}>Past Orders</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", margin: 0 }}>
          Review your previous Phantom Store purchases.
        </p>
      </div>

      {loading && (
        <div className="glass" style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--text-muted)" }}>
          Loading your orders...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div
          className="glass"
          style={{
            display: "grid",
            gap: 12,
            padding: "var(--space-2xl)",
            textAlign: "center",
            color: "var(--text-muted)"
          }}
        >
          <h2 style={{ margin: 0, color: "var(--text-primary)" }}>No orders yet</h2>
          <p style={{ margin: 0 }}>Once you complete a purchase, it will show up here.</p>
          <div>
            <Link to="/" className="btn btn-primary" style={{ padding: "12px 22px" }}>
              Start Shopping
            </Link>
          </div>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div style={{ display: "grid", gap: "var(--space-lg)" }}>
          {orders.map((order) => (
            <article key={order._id} className="glass-strong" style={{ padding: "var(--space-lg)", display: "grid", gap: "var(--space-md)" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "var(--space-md)",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)" }}>Order placed</p>
                  <p style={{ margin: "4px 0 0", fontWeight: 700 }}>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: `${statusColors[order.status] || "var(--bg-elevated)"}22`,
                      color: statusColors[order.status] || "var(--text-primary)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "capitalize"
                    }}
                  >
                    {order.status}
                  </span>
                  <strong style={{ fontSize: "1rem" }}>Rs. {Number(order.total || 0).toFixed(2)}</strong>
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {order.items?.map((item, index) => (
                  <div
                    key={`${order._id}-${item.productId || index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px 1fr auto",
                      gap: "var(--space-md)",
                      alignItems: "center",
                      padding: "10px 0",
                      borderTop: "1px solid var(--border-subtle)"
                    }}
                  >
                    <img
                      src={item.image || "https://placehold.co/600x450/0c1119/6366f1?text=Phantom+Store"}
                      alt={item.name}
                      style={{ width: 72, height: 54, objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                      onError={handleImageError}
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                      <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        Qty {item.quantity} · Rs. {Number(item.price || 0).toFixed(2)}
                      </p>
                    </div>
                    <strong style={{ whiteSpace: "nowrap" }}>
                      Rs. {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
