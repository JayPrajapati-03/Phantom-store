import React, { useMemo, useState } from "react";
import { panelStyle, cardStyle, inputStyle, labelStyle, buttonStyle, secondaryStyle, dangerStyle, formatStatus, categoryOptions, arCategoryOptions } from "./adminStyles.js";
import { getProductImageSrc, handleImageError } from "../../utils/productImages.js";

const productsPerPage = 12;
const emptyForm = { name: "", description: "", price: "", category: "glasses", arCategory: "glasses", stock: "" };

export default function ProductsView({
  products, stores, activeStoreId, selectedStoreId, setSelectedStoreId,
  saving, setSaving, loadData
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [productPage, setProductPage] = useState(1);

  const activeStore = stores.find((s) => s._id === activeStoreId) || stores[0] || null;

  const resetForm = () => { setEditingId(null); setForm(emptyForm); setImageFiles([]); setModelFile(null); setFormError(""); };

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchStore = !activeStoreId || String(p.storeId?._id || p.storeId || "") === activeStoreId;
      const matchQ = !q || [p.name, p.category, p.arCategory, p.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
      return matchStore && matchQ;
    });
  }, [activeStoreId, productQuery, products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, productPage]);

  const selectedImageNames = Array.from(imageFiles || []).map((f) => f.name).join(", ");

  const validateForm = () => {
    if (!String(form.name || "").trim()) return "Product name is required";
    if (!String(form.description || "").trim()) return "Description is required";
    if (form.price === "" || Number.isNaN(Number(form.price))) return "Valid price is required";
    if (!String(form.category || "").trim()) return "Category is required";
    if (!String(form.arCategory || "").trim()) return "AR category is required";
    if (!editingId && !modelFile) return "A 3D model file is required when creating a product";
    return "";
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!activeStoreId) { setFormError("Create or select a store first"); return; }
    const msg = validateForm();
    if (msg) { setFormError(msg); return; }
    try {
      setSaving(true);
      const api = (await import("../../utils/api.js")).default;
      const payload = new FormData();
      Object.entries({ ...form, storeId: activeStoreId }).forEach(([k, v]) => payload.append(k, v));
      Array.from(imageFiles).forEach((f) => payload.append("images", f));
      if (modelFile) payload.append("model", modelFile);
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      resetForm();
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Unable to save product");
    } finally { setSaving(false); }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setSelectedStoreId(product.storeId?._id || selectedStoreId);
    setForm({
      name: product.name || "", description: product.description || "",
      price: String(product.price ?? ""), category: product.category || "glasses",
      arCategory: product.arCategory || "glasses", stock: String(product.stock ?? "")
    });
    setImageFiles([]); setModelFile(null); setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeProduct = async (id) => {
    const p = products.find((item) => item._id === id);
    if (!window.confirm(`Delete "${p?.name || "this product"}"?`)) return;
    try {
      const api = (await import("../../utils/api.js")).default;
      await api.delete(`/products/${id}`);
      loadData();
    } catch (err) { /* toast error */ }
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Header */}
      <section style={{
        ...panelStyle, padding: 28
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "#8ea7db", fontSize: 12 }}>Product studio</p>
            <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>Manage your product catalog</h1>
          </div>
          <div style={{ minWidth: 260, display: "grid", gap: 10 }}>
            <label style={labelStyle}>
              Active store
              <select style={inputStyle} value={activeStoreId} onChange={(e) => setSelectedStoreId(e.target.value)}>
                {stores.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Form + Preview */}
      <section style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1.05fr) minmax(320px, 1fr)", gap: 24 }}>
        <form onSubmit={submit} style={{ ...panelStyle, padding: 24, display: "grid", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "start" }}>
            <div style={{ display: "grid", gap: 8 }}>
              <p style={{ margin: 0, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>Product form</p>
              <h2 style={{ margin: 0 }}>{editingId ? "Edit product" : "Create a new product"}</h2>
            </div>
            {editingId && <button type="button" style={secondaryStyle} onClick={resetForm}>Cancel edit</button>}
          </div>

          {!!formError && (
            <div style={{ border: "1px solid rgba(248,113,113,0.35)", borderRadius: 14, background: "rgba(248,113,113,0.08)", color: "var(--error)", padding: "12px 14px" }}>
              {formError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 14 }}>
            <label style={labelStyle}>Product name
              <input style={inputStyle} placeholder="Monaco Weekend Shades" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label style={labelStyle}>Price
              <input style={inputStyle} placeholder="89" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </label>
          </div>

          <label style={labelStyle}>Description
            <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} placeholder="Describe the product." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <label style={labelStyle}>Category
              <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categoryOptions.map((o) => <option key={o} value={o}>{formatStatus(o)}</option>)}
              </select>
            </label>
            <label style={labelStyle}>AR category
              <select style={inputStyle} value={form.arCategory} onChange={(e) => setForm({ ...form, arCategory: e.target.value })}>
                {arCategoryOptions.map((o) => <option key={o} value={o}>{formatStatus(o)}</option>)}
              </select>
            </label>
            <label style={labelStyle}>Stock
              <input style={inputStyle} placeholder="24" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </label>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ ...cardStyle, padding: 16, display: "grid", gap: 10 }}>
              <label style={labelStyle}>Product images
                <input style={inputStyle} type="file" multiple accept="image/*" onChange={(e) => setImageFiles(e.target.files || [])} />
              </label>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>{selectedImageNames || "Upload storefront images."}</p>
            </div>
            <div style={{ ...cardStyle, padding: 16, display: "grid", gap: 10 }}>
              <label style={labelStyle}>3D model
                <input style={inputStyle} type="file" accept=".glb,.gltf,model/gltf-binary" onChange={(e) => setModelFile(e.target.files?.[0] || null)} />
              </label>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>{modelFile?.name || "Attach a GLB or GLTF model."}</p>
              {!editingId && <p style={{ margin: 0, color: "var(--error)", fontSize: 12 }}>Required for new products.</p>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button style={buttonStyle} disabled={saving}>{saving ? "Saving..." : editingId ? "Save product" : "Create product"}</button>
            <button type="button" style={secondaryStyle} onClick={resetForm}>Reset</button>
          </div>
        </form>

        {/* Live Preview */}
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 18, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>Live preview</p>
            <h2 style={{ margin: 0 }}>{activeStore?.name || "No active store"}</h2>
          </div>
          <div style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", minHeight: 170 }}>
              <img src={getProductImageSrc({ name: form.name || "Preview", arCategory: form.arCategory, images: [] })} alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", background: "#0c1119" }} onError={handleImageError} />
              <div style={{ padding: 18, display: "grid", gap: 10 }}>
                <strong style={{ fontSize: 20 }}>{form.name || "Product preview"}</strong>
                <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.5 }}>{form.description || "Your product summary will show here."}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ padding: "7px 10px", borderRadius: 999, background: "var(--accent-subtle)", color: "var(--accent-light)", fontSize: 12 }}>{formatStatus(form.category || "category")}</span>
                  <span style={{ padding: "7px 10px", borderRadius: 999, background: "var(--accent-subtle)", color: "var(--text-accent)", fontSize: 12 }}>AR: {formatStatus(form.arCategory || "glasses")}</span>
                  <span style={{ padding: "7px 10px", borderRadius: 999, background: "rgba(52,211,153,0.12)", color: "var(--success)", fontSize: 12 }}>Stock {form.stock || "0"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* Product Library */}
      <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>Product library</p>
            <h2 style={{ margin: 0 }}>Browse and edit your catalog</h2>
          </div>
          <label style={{ ...labelStyle, minWidth: 280 }}>Search products
            <input style={inputStyle} placeholder="Search by name, category..." value={productQuery} onChange={(e) => { setProductQuery(e.target.value); setProductPage(1); }} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {paginatedProducts.map((product) => (
            <article key={product._id} style={{ ...cardStyle, overflow: "hidden", display: "grid" }}>
              <img src={getProductImageSrc(product)} alt={product.name}
                style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", background: "var(--bg-surface)" }} onError={handleImageError} />
              <div style={{ padding: 16, display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <strong style={{ fontSize: 18 }}>{product.name}</strong>
                  <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.5 }}>{product.description?.slice(0, 110) || "No description."}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "var(--accent-subtle)", color: "var(--accent-light)", fontSize: 12 }}>{product.category}</span>
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "var(--accent-subtle)", color: "var(--text-accent)", fontSize: 12 }}>AR {product.arCategory}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "var(--text-primary)" }}>
                  <span>${Number(product.price).toFixed(2)}</span>
                  <span>Stock {product.stock}</span>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button style={buttonStyle} onClick={() => startEdit(product)}>Edit</button>
                  <button style={dangerStyle} onClick={() => removeProduct(product._id)}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length > productsPerPage && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              {(productPage - 1) * productsPerPage + 1}-{Math.min(productPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" style={secondaryStyle} disabled={productPage === 1} onClick={() => setProductPage((c) => c - 1)}>Previous</button>
              <span style={{ padding: "12px 14px", borderRadius: 14, background: "var(--bg-elevated)", color: "var(--text-primary)", minWidth: 92, textAlign: "center", fontWeight: 700 }}>
                {productPage} / {totalPages}
              </span>
              <button type="button" style={secondaryStyle} disabled={productPage === totalPages} onClick={() => setProductPage((c) => c + 1)}>Next</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
