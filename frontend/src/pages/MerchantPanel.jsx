import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useAuthStore } from "../store/authStore.js";
import { getProductImageSrc } from "../utils/productImages.js";

const emptyForm = { name: "", description: "", price: "", category: "", arCategory: "", stock: "" };
const emptyStoreForm = { name: "", description: "" };

export default function MerchantPanel() {
  const { user } = useAuthStore();
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [storeForm, setStoreForm] = useState(emptyStoreForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [tab, setTab] = useState("store");
  const [creatingStore, setCreatingStore] = useState(false);

  const myStore = useMemo(() => stores[0] || null, [stores]);

  const loadData = async () => {
    try {
      const storesRes = await api.get("/stores/my");
      const myStores = storesRes.data.stores || [];
      setStores(myStores);

      if (myStores.length > 0) {
        const productsRes = await api.get("/products", { params: { storeId: myStores[0]._id, limit: 100 } });
        setProducts(productsRes.data.products || []);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => { loadData(); }, []);

  const createStore = async (e) => {
    e.preventDefault();
    if (!storeForm.name.trim()) { toast.error("Store name is required"); return; }
    setCreatingStore(true);
    try {
      await api.post("/stores", storeForm);
      toast.success("Store created!");
      setStoreForm(emptyStoreForm);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create store");
    } finally {
      setCreatingStore(false);
    }
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    if (!myStore) { toast.error("Create a store first"); return; }

    const payload = new FormData();
    Object.entries({ ...form, storeId: myStore._id }).forEach(([key, value]) => payload.append(key, value));
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

  return (
    <section style={{ display: "grid", gap: "var(--space-xl)", animation: "fadeInUp 0.4s var(--ease-out)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", flexWrap: "wrap" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg, #10b981, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(16,185,129,0.25)"
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Merchant Portal</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.875rem" }}>
            Welcome, {user?.name || "Merchant"} · {myStore ? myStore.name : "No store yet"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", padding: 4, width: "fit-content" }}>
        {["store", "products"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              border: "none",
              background: tab === t ? "#10b981" : "transparent",
              color: tab === t ? "#fff" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s var(--ease-out)",
              textTransform: "capitalize"
            }}
          >{t === "store" ? "My Store" : "Products"}</button>
        ))}
      </div>

      {/* Store Tab */}
      {tab === "store" && (
        <>
          {!myStore ? (
            <form onSubmit={createStore} className="glass" style={{ padding: "var(--space-lg)", display: "grid", gap: "var(--space-md)", maxWidth: 500 }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Create Your Store</h2>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.875rem" }}>Set up your first store to start adding products.</p>
              <input className="input" placeholder="Store name" value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} required />
              <textarea className="input" placeholder="Store description" value={storeForm.description} onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })} rows={3} />
              <button className="btn" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none", boxShadow: "0 2px 12px rgba(16,185,129,0.25)" }} disabled={creatingStore}>
                {creatingStore ? "Creating..." : "Create Store"}
              </button>
            </form>
          ) : (
            <div className="glass" style={{ padding: "var(--space-lg)", display: "grid", gap: "var(--space-md)" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Store Overview</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-md)" }}>
                <div style={{ padding: "var(--space-md)", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Store Name</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{myStore.name}</p>
                </div>
                <div style={{ padding: "var(--space-md)", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Total Products</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: "#10b981" }}>{products.length}</p>
                </div>
                <div style={{ padding: "var(--space-md)", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Owner</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{user?.name}</p>
                </div>
              </div>
              {myStore.description && (
                <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9375rem" }}>{myStore.description}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Products Tab */}
      {tab === "products" && (
        <>
          {!myStore ? (
            <div style={{ textAlign: "center", padding: "var(--space-2xl)", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "1rem", fontWeight: 500 }}>Create a store first to manage products</p>
              <button className="btn" style={{ marginTop: 12, background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none" }} onClick={() => setTab("store")}>
                Go to Store tab
              </button>
            </div>
          ) : (
            <>
              {/* Product form */}
              <form onSubmit={submitProduct} className="glass" style={{ padding: "var(--space-lg)", display: "grid", gap: "var(--space-md)" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{editingId ? "Edit Product" : "Add Product"}</h2>
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
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none" }}>
                    {editingId ? "Save Product" : "Add Product"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>
                  )}
                </div>
              </form>

              {/* Product list */}
              <div style={{ display: "grid", gap: 8 }}>
                <div className="section-label">Your Products ({products.length})</div>
                {!products.length && (
                  <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-xl)" }}>No products yet. Add your first product above.</p>
                )}
                {products.map((product) => (
                  <div key={product._id} className="glass" style={{
                    display: "grid", gridTemplateColumns: "64px 1fr auto",
                    gap: "var(--space-md)", padding: "var(--space-md)", alignItems: "center"
                  }}>
                    <img src={getProductImageSrc(product)} alt={product.name} style={{ width: 64, height: 48, objectFit: "cover", borderRadius: "var(--radius-sm)" }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{product.name}</p>
                      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                        {product.category} · ${Number(product.price).toFixed(2)} · Stock: {product.stock}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost" style={{ fontSize: "0.8125rem", padding: "6px 12px" }} onClick={() => startEdit(product)}>Edit</button>
                      <button className="btn btn-ghost" style={{ fontSize: "0.8125rem", padding: "6px 12px", color: "var(--error)" }} onClick={() => removeProduct(product._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
