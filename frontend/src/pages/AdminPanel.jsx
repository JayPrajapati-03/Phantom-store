import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api.js";

const emptyForm = { name: "", description: "", price: "", category: "", arCategory: "", stock: "" };

const statusColors = {
  pending: "status-pending",
  paid: "status-paid",
  processing: "status-processing",
  shipped: "status-shipped",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
  refunded: "status-refunded"
};

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [tab, setTab] = useState("products");

  const activeStoreId = useMemo(() => stores[0]?._id || "", [stores]);

  const loadData = async () => {
    const [productsRes, ordersRes, storesRes] = await Promise.all([
      api.get("/products", { params: { limit: 100 } }),
      api.get("/orders"),
      api.get("/stores", { params: { limit: 20 } })
    ]);
    setProducts(productsRes.data.products || []);
    setOrders(ordersRes.data.orders || []);
    setStores(storesRes.data.stores || []);
  };

  useEffect(() => { loadData().catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!activeStoreId) { toast.error("No store available for product upload"); return; }

    const payload = new FormData();
    Object.entries({ ...form, storeId: activeStoreId }).forEach(([key, value]) => payload.append(key, value));
    Array.from(imageFiles).forEach((file) => payload.append("images", file));
    if (modelFile) payload.append("model", modelFile);

    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
      toast.success("Product updated");
    } else {
      await api.post("/products", payload);
      toast.success("Product created");
    }
    setEditingId(null);
    setForm(emptyForm);
    setImageFiles([]);
    setModelFile(null);
    loadData();
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({ name: product.name, description: product.description, price: String(product.price), category: product.category, arCategory: product.arCategory, stock: String(product.stock) });
    setTab("products");
  };

  const removeProduct = async (id) => { await api.delete(`/products/${id}`); toast.success("Product deleted"); loadData(); };
  const updateStatus = async (id, status) => { await api.patch(`/orders/${id}/status`, { status }); toast.success("Order status updated"); loadData(); };

  return (
    <section style={{ display: "grid", gap: "var(--space-xl)", animation: "fadeInUp 0.4s var(--ease-out)" }}>
      <div>
        <h1 style={{ margin: "0 0 4px" }}>Admin Panel</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
          {products.length} products · {orders.length} orders
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", padding: 4, width: "fit-content" }}>
        {["products", "orders"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              border: "none",
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "#fff" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s var(--ease-out)",
              textTransform: "capitalize"
            }}
          >{t}</button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === "products" && (
        <>
          {/* Form */}
          <form onSubmit={submit} className="glass" style={{ padding: "var(--space-lg)", display: "grid", gap: "var(--space-md)" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{editingId ? "Edit product" : "Upload product"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
              <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className="input" placeholder="AR Category" value={form.arCategory} onChange={(e) => setForm({ ...form, arCategory: e.target.value })} />
              <input className="input" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
              <input className="input" type="file" multiple accept="image/*" onChange={(e) => setImageFiles(e.target.files)} />
              <input className="input" type="file" accept=".glb,.gltf,model/gltf-binary" onChange={(e) => setModelFile(e.target.files?.[0] || null)} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary">{editingId ? "Save product" : "Create product"}</button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>
              )}
            </div>
          </form>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }}>
              <thead>
                <tr>
                  {["Name", "Category", "Price", "Stock", "Actions"].map((label) => (
                    <th key={label} style={{
                      textAlign: "left", padding: "12px 16px", color: "var(--text-muted)",
                      fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase",
                      letterSpacing: "0.06em"
                    }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} style={{
                    background: "var(--bg-surface)",
                    transition: "background 0.2s"
                  }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-surface)"}>
                    <td style={{ padding: "12px 16px", borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)", fontWeight: 500 }}>{product.name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="badge badge-accent">{product.category}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--accent-light)" }}>${Number(product.price).toFixed(2)}</td>
                    <td style={{ padding: "12px 16px" }}>{product.stock}</td>
                    <td style={{ padding: "12px 16px", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost" style={{ fontSize: "0.8125rem", padding: "6px 12px" }} onClick={() => startEdit(product)}>Edit</button>
                        <button className="btn btn-ghost" style={{ fontSize: "0.8125rem", padding: "6px 12px", color: "var(--error)" }} onClick={() => removeProduct(product._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((order) => (
            <div key={order._id} className="glass" style={{ padding: "var(--space-md)", display: "grid", gap: "var(--space-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`badge ${statusColors[order.status] || ""}`}>{order.status}</span>
                  <code style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{order._id}</code>
                </div>
                <span style={{ fontWeight: 700, color: "var(--accent-light)" }}>${Number(order.total).toFixed(2)}</span>
              </div>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                {order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}
              </p>
              <select
                className="select"
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                style={{ maxWidth: 220 }}
              >
                {["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          ))}
          {!orders.length && (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-xl)" }}>No orders yet</p>
          )}
        </div>
      )}
    </section>
  );
}
