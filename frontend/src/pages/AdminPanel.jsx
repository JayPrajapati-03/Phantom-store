import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api.js";

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
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700
};

const secondaryStyle = {
  ...buttonStyle,
  background: "#263044"
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  arCategory: "",
  stock: ""
};

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);

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

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    if (!activeStoreId) {
      toast.error("No store available for product upload");
      return;
    }

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
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      arCategory: product.arCategory,
      stock: String(product.stock)
    });
  };

  const removeProduct = async (id) => {
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    loadData();
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success("Order status updated");
    loadData();
  };

  return (
    <section style={{ display: "grid", gap: 28 }}>
      <section style={{ display: "grid", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Admin Panel</h1>
        <form onSubmit={submit} style={{ display: "grid", gap: 12, padding: 18, border: "1px solid #252d3d", borderRadius: 12 }}>
          <h2 style={{ margin: 0 }}>{editingId ? "Edit product" : "Upload product"}</h2>
          <input style={inputStyle} placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <textarea style={inputStyle} placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <input style={inputStyle} placeholder="Price" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          <input style={inputStyle} placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          <input style={inputStyle} placeholder="AR Category" value={form.arCategory} onChange={(event) => setForm({ ...form, arCategory: event.target.value })} />
          <input style={inputStyle} placeholder="Stock" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
          <input style={inputStyle} type="file" multiple accept="image/*" onChange={(event) => setImageFiles(event.target.files)} />
          <input style={inputStyle} type="file" accept=".glb,.gltf,model/gltf-binary" onChange={(event) => setModelFile(event.target.files?.[0] || null)} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={buttonStyle}>{editingId ? "Save product" : "Create product"}</button>
            {editingId && (
              <button type="button" style={secondaryStyle} onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Products</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Name", "Category", "Price", "Stock", "Actions"].map((label) => (
                  <th key={label} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #252d3d" }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #1d2431" }}>{product.name}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #1d2431" }}>{product.category}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #1d2431" }}>${Number(product.price).toFixed(2)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #1d2431" }}>{product.stock}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid #1d2431", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button style={buttonStyle} onClick={() => startEdit(product)}>Edit</button>
                    <button style={secondaryStyle} onClick={() => removeProduct(product._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {orders.map((order) => (
            <div key={order._id} style={{ border: "1px solid #252d3d", borderRadius: 10, padding: 14, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{order._id}</strong>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
              <p style={{ margin: 0, color: "#abb7ce" }}>{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
              <select value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)} style={inputStyle}>
                {["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
