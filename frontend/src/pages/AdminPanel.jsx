import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { getProductImageSrc, handleImageError } from "../utils/productImages.js";

const panelStyle = {
  border: "1px solid rgba(101, 123, 168, 0.22)",
  borderRadius: 24,
  background: "linear-gradient(180deg, rgba(16, 21, 31, 0.96), rgba(11, 14, 22, 0.98))",
  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)"
};

const cardStyle = {
  border: "1px solid rgba(92, 111, 150, 0.2)",
  borderRadius: 20,
  background: "rgba(18, 23, 34, 0.92)"
};

const inputStyle = {
  width: "100%",
  border: "1px solid #2a3346",
  borderRadius: 14,
  background: "#111722",
  color: "#fff",
  padding: "13px 14px",
  outline: "none"
};

const labelStyle = {
  display: "grid",
  gap: 8,
  color: "#dbe5ff",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.02em"
};

const buttonStyle = {
  border: "0",
  borderRadius: 14,
  background: "linear-gradient(135deg, #8a5cff, #5d8bff)",
  color: "#fff",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 800,
  boxShadow: "0 12px 30px rgba(93, 139, 255, 0.2)"
};

const secondaryStyle = {
  ...buttonStyle,
  background: "#263044",
  boxShadow: "none"
};

const dangerStyle = {
  ...buttonStyle,
  background: "#2b1d24",
  color: "#ffb9cb",
  boxShadow: "none"
};

const statusColors = {
  pending: { bg: "rgba(251, 191, 36, 0.14)", text: "#facc15" },
  paid: { bg: "rgba(34, 197, 94, 0.14)", text: "#4ade80" },
  processing: { bg: "rgba(59, 130, 246, 0.14)", text: "#60a5fa" },
  shipped: { bg: "rgba(45, 212, 191, 0.14)", text: "#5eead4" },
  delivered: { bg: "rgba(132, 204, 22, 0.14)", text: "#a3e635" },
  cancelled: { bg: "rgba(248, 113, 113, 0.14)", text: "#fca5a5" },
  refunded: { bg: "rgba(244, 114, 182, 0.14)", text: "#f9a8d4" }
};

const categoryOptions = ["glasses", "jackets", "bags", "watches", "shirts", "shoes", "rings", "hats"];
const arCategoryOptions = ["glasses", "jacket", "bag", "watch", "shirt", "shoes", "ring", "hat"];
const productsPerPage = 12;
const emptyMerchantForm = {
  name: "",
  email: "",
  password: ""
};
const emptyStoreForm = {
  name: "",
  description: "",
  ownerId: ""
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "glasses",
  arCategory: "glasses",
  stock: ""
};

const formatStatus = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

const getStatusStyle = (status) => statusColors[status] || { bg: "rgba(124, 92, 255, 0.14)", text: "#c4b5fd" };

const statBlock = (label, value, accent) => ({
  display: "grid",
  gap: 6,
  padding: 18,
  borderRadius: 18,
  background: accent,
  border: "1px solid rgba(255, 255, 255, 0.08)"
});

const dashboardTabStyle = (active) => ({
  border: active ? "1px solid rgba(136, 167, 255, 0.45)" : "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: active ? "0 16px 34px rgba(93, 139, 255, 0.16)" : "none",
  transform: active ? "translateY(-1px)" : "none"
});

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingMerchant, setCreatingMerchant] = useState(false);
  const [creatingStore, setCreatingStore] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [activeView, setActiveView] = useState("products");
  const [merchantForm, setMerchantForm] = useState(emptyMerchantForm);
  const [storeForm, setStoreForm] = useState(emptyStoreForm);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [formError, setFormError] = useState("");

  const activeStoreId = selectedStoreId || stores[0]?._id || "";
  const activeStore = stores.find((store) => store._id === activeStoreId) || stores[0] || null;

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, storesRes, merchantsRes] = await Promise.all([
        api.get("/products", { params: { limit: 100 } }),
        api.get("/orders"),
        api.get("/stores", { params: { limit: 20 } }),
        api.get("/auth/merchants")
      ]);

      const nextProducts = productsRes.data.products || [];
      const nextOrders = ordersRes.data.orders || [];
      const nextStores = storesRes.data.stores || [];
      const nextMerchants = merchantsRes.data.merchants || [];

      setProducts(nextProducts);
      setOrders(nextOrders);
      setStores(nextStores);
      setMerchants(nextMerchants);
      setSelectedStoreId((current) => current || nextStores[0]?._id || "");
      setStoreForm((current) => ({
        ...current,
        ownerId: current.ownerId || nextMerchants[0]?._id || ""
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  useEffect(() => {
    setProductPage(1);
  }, [activeStoreId, productQuery]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFiles([]);
    setModelFile(null);
    setFormError("");
  };

  const createMerchant = async (event) => {
    event.preventDefault();

    if (!merchantForm.name.trim() || !merchantForm.email.trim() || !merchantForm.password.trim()) {
      toast.error("Merchant name, email, and password are required");
      return;
    }

    try {
      setCreatingMerchant(true);
      const res = await api.post("/auth/admin/merchants", merchantForm);
      const newMerchant = res.data.user;
      setMerchants((current) => [newMerchant, ...current]);
      setStoreForm((current) => ({
        ...current,
        ownerId: current.ownerId || newMerchant?._id || ""
      }));
      setMerchantForm(emptyMerchantForm);
      toast.success("Merchant created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create merchant");
    } finally {
      setCreatingMerchant(false);
    }
  };

  const createStore = async (event) => {
    event.preventDefault();

    if (!String(storeForm.name || "").trim()) {
      toast.error("Store name is required");
      return;
    }

    if (!String(storeForm.ownerId || "").trim()) {
      toast.error("Select a merchant owner first");
      return;
    }

    try {
      setCreatingStore(true);
      const res = await api.post("/stores", storeForm);
      const newStore = res.data.store;
      setStores((current) => [newStore, ...current]);
      setSelectedStoreId(newStore?._id || "");
      setStoreForm((current) => ({
        ...emptyStoreForm,
        ownerId: current.ownerId
      }));
      toast.success("Store created");
      loadData().catch(() => {});
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create store");
    } finally {
      setCreatingStore(false);
    }
  };

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

    if (!activeStoreId) {
      toast.error("Create or select a store before uploading products");
      return;
    }

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      toast.error(validationMessage);
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      Object.entries({ ...form, storeId: activeStoreId }).forEach(([key, value]) => payload.append(key, value));
      Array.from(imageFiles).forEach((file) => payload.append("images", file));
      if (modelFile) payload.append("model", modelFile);

      if (editingId) {
        const res = await api.put(`/products/${editingId}`, payload);
        const updatedProduct = res.data.product;
        if (updatedProduct) {
          setProducts((current) => current.map((p) => (p._id === editingId ? updatedProduct : p)));
        }
        toast.success("Product updated");
      } else {
        const res = await api.post("/products", payload);
        const newProduct = res.data.product;
        if (newProduct) {
          setProducts((current) => [newProduct, ...current]);
        }
        toast.success("Product created");
      }

      resetForm();
      // Only refresh in background if needed, but local state is already updated
      loadData().catch(() => {});
    } catch (error) {
      const message = error.response?.data?.message || "Unable to save product";
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setSelectedStoreId(product.storeId?._id || selectedStoreId);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: product.category || "glasses",
      arCategory: product.arCategory || "glasses",
      stock: String(product.stock ?? "")
    });
    setImageFiles([]);
    setModelFile(null);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeProduct = async (id) => {
    const product = products.find((item) => item._id === id);
    if (!window.confirm(`Delete "${product?.name || "this product"}"?`)) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete product");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders((current) => current.map((order) => (order._id === id ? { ...order, status } : order)));
      toast.success("Order status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update order status");
    }
  };

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesStore = !activeStoreId || String(product.storeId?._id || product.storeId || "") === activeStoreId;
      const matchesQuery =
        !query ||
        [product.name, product.category, product.arCategory, product.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesStore && matchesQuery;
    });
  }, [activeStoreId, productQuery, products]);

  const totalInventoryValue = useMemo(
    () => filteredProducts.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0),
    [filteredProducts]
  );

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, productPage]);

  const pendingOrders = orders.filter((order) => ["pending", "paid", "processing"].includes(order.status)).length;
  const selectedImageNames = Array.from(imageFiles || []).map((file) => file.name).join(", ");

  return (
    <section style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          ...panelStyle,
          padding: 28,
          display: "grid",
          gap: 24,
          background:
            "radial-gradient(circle at top right, rgba(93, 139, 255, 0.22), transparent 32%), radial-gradient(circle at top left, rgba(138, 92, 255, 0.2), transparent 26%), linear-gradient(180deg, rgba(16, 21, 31, 0.96), rgba(11, 14, 22, 0.98))"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ display: "grid", gap: 10, maxWidth: 760 }}>
            <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "#8ea7db", fontSize: 12 }}>
              Admin workspace
            </p>
            <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.3rem)", lineHeight: 1.02 }}>Run your catalog like a control room.</h1>
            <p style={{ margin: 0, color: "#b8c4de", maxWidth: 620 }}>
              Manage stores, stage AR-ready products, and move orders forward from one focused dashboard.
            </p>
          </div>
          <div style={{ minWidth: 280, display: "grid", gap: 10 }}>
            <label style={labelStyle}>
              Active store
              <select style={inputStyle} value={activeStoreId} onChange={(event) => setSelectedStoreId(event.target.value)}>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </label>
            <p style={{ margin: 0, color: "#9aa9c7", fontSize: 13 }}>
              {activeStore ? activeStore.description || "Store selected for product uploads." : "No store found yet."}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <button
            type="button"
            onClick={() => setActiveView("products")}
            style={{
              ...statBlock("Products", filteredProducts.length, "linear-gradient(135deg, rgba(93, 139, 255, 0.16), rgba(31, 39, 57, 0.92))"),
              ...dashboardTabStyle(activeView === "products"),
              textAlign: "left",
              color: "inherit",
              cursor: "pointer"
            }}
          >
            <span style={{ color: "#9bb5ec", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Products</span>
            <strong style={{ fontSize: 30 }}>{filteredProducts.length}</strong>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("orders")}
            style={{
              ...statBlock("Orders", orders.length, "linear-gradient(135deg, rgba(138, 92, 255, 0.16), rgba(31, 39, 57, 0.92))"),
              ...dashboardTabStyle(activeView === "orders"),
              textAlign: "left",
              color: "inherit",
              cursor: "pointer"
            }}
          >
            <span style={{ color: "#b4a7ff", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Orders</span>
            <strong style={{ fontSize: 30 }}>{orders.length}</strong>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("orders")}
            style={{
              ...statBlock("Open Orders", pendingOrders, "linear-gradient(135deg, rgba(250, 204, 21, 0.12), rgba(31, 39, 57, 0.92))"),
              ...dashboardTabStyle(activeView === "orders"),
              textAlign: "left",
              color: "inherit",
              cursor: "pointer"
            }}
          >
            <span style={{ color: "#facc15", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Open Orders</span>
            <strong style={{ fontSize: 30 }}>{pendingOrders}</strong>
          </button>
          <div style={statBlock("Inventory Value", `$${totalInventoryValue.toFixed(0)}`, "linear-gradient(135deg, rgba(74, 222, 128, 0.12), rgba(31, 39, 57, 0.92))")}>
            <span style={{ color: "#86efac", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Inventory Value</span>
            <strong style={{ fontSize: 30 }}>{`$${totalInventoryValue.toFixed(0)}`}</strong>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "minmax(320px, 0.95fr) minmax(320px, 1.05fr)", gap: 24 }}>
        <form onSubmit={createMerchant} style={{ ...panelStyle, padding: 24, display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "#8ea7db", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>
              Merchant access
            </p>
            <h2 style={{ margin: 0 }}>Create a merchant account</h2>
            <p style={{ margin: 0, color: "#b8c4de" }}>
              Add a new merchant so you can assign them a store and hand off catalog management.
            </p>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <label style={labelStyle}>
              Merchant name
              <input
                style={inputStyle}
                placeholder="Maya Merchant"
                value={merchantForm.name}
                onChange={(event) => setMerchantForm({ ...merchantForm, name: event.target.value })}
              />
            </label>
            <label style={labelStyle}>
              Email
              <input
                style={inputStyle}
                type="email"
                placeholder="merchant@example.com"
                value={merchantForm.email}
                onChange={(event) => setMerchantForm({ ...merchantForm, email: event.target.value })}
              />
            </label>
            <label style={labelStyle}>
              Temporary password
              <input
                style={inputStyle}
                type="password"
                placeholder="At least 8 characters"
                value={merchantForm.password}
                onChange={(event) => setMerchantForm({ ...merchantForm, password: event.target.value })}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <button style={buttonStyle} disabled={creatingMerchant}>
              {creatingMerchant ? "Creating..." : "Create merchant"}
            </button>
            <span style={{ color: "#8ea0c2", fontSize: 13 }}>
              Merchants available: {merchants.length}
            </span>
          </div>
        </form>

        <form onSubmit={createStore} style={{ ...panelStyle, padding: 24, display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "#8ea7db", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>
              Store setup
            </p>
            <h2 style={{ margin: 0 }}>Create and assign a store</h2>
            <p style={{ margin: 0, color: "#b8c4de" }}>
              Pick a merchant owner, create the storefront, then manage products for that store below.
            </p>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <label style={labelStyle}>
              Store name
              <input
                style={inputStyle}
                placeholder="Phantom Signature Store"
                value={storeForm.name}
                onChange={(event) => setStoreForm({ ...storeForm, name: event.target.value })}
              />
            </label>
            <label style={labelStyle}>
              Assigned merchant
              <select
                style={inputStyle}
                value={storeForm.ownerId}
                onChange={(event) => setStoreForm({ ...storeForm, ownerId: event.target.value })}
              >
                <option value="">Select merchant</option>
                {merchants.map((merchant) => (
                  <option key={merchant._id} value={merchant._id}>
                    {merchant.name} · {merchant.email}
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              Description
              <textarea
                style={{ ...inputStyle, minHeight: 108, resize: "vertical" }}
                placeholder="Describe what this store offers."
                value={storeForm.description}
                onChange={(event) => setStoreForm({ ...storeForm, description: event.target.value })}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <button style={buttonStyle} disabled={creatingStore || !merchants.length}>
              {creatingStore ? "Creating..." : "Create store"}
            </button>
            <span style={{ color: "#8ea0c2", fontSize: 13 }}>
              {merchants.length ? "Assign stores to merchants from this panel." : "Create a merchant first."}
            </span>
          </div>
        </form>
      </section>

      {activeView === "products" && (
      <section style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1.05fr) minmax(320px, 1fr)", gap: 24 }}>
        <form onSubmit={submit} style={{ ...panelStyle, padding: 24, display: "grid", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "start" }}>
            <div style={{ display: "grid", gap: 8 }}>
              <p style={{ margin: 0, color: "#8ea7db", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>
                Product studio
              </p>
              <h2 style={{ margin: 0 }}>{editingId ? "Edit product" : "Create a new product"}</h2>
            </div>
            {editingId && (
              <button type="button" style={secondaryStyle} onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>

          {!!formError && (
            <div
              style={{
                border: "1px solid rgba(248, 113, 113, 0.35)",
                borderRadius: 14,
                background: "rgba(69, 24, 38, 0.45)",
                color: "#fecdd3",
                padding: "12px 14px"
              }}
            >
              {formError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 14 }}>
            <label style={labelStyle}>
              Product name
              <input style={inputStyle} placeholder="Monaco Weekend Shades" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label style={labelStyle}>
              Price
              <input style={inputStyle} placeholder="89" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            </label>
          </div>

          <label style={labelStyle}>
            Description
            <textarea
              style={{ ...inputStyle, minHeight: 124, resize: "vertical" }}
              placeholder="Describe the fit, styling, and AR value of the item."
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
            <label style={labelStyle}>
              Category
              <select style={inputStyle} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatStatus(option)}
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              AR category
              <select style={inputStyle} value={form.arCategory} onChange={(event) => setForm({ ...form, arCategory: event.target.value })}>
                {arCategoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatStatus(option)}
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              Stock
              <input style={inputStyle} placeholder="24" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
            </label>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ ...cardStyle, padding: 16, display: "grid", gap: 10 }}>
              <label style={labelStyle}>
                Product images
                <input style={inputStyle} type="file" multiple accept="image/*" onChange={(event) => setImageFiles(event.target.files || [])} />
              </label>
              <p style={{ margin: 0, color: "#8ea0c2", fontSize: 13 }}>
                {selectedImageNames || "Upload one or more storefront images."}
              </p>
            </div>

            <div style={{ ...cardStyle, padding: 16, display: "grid", gap: 10 }}>
              <label style={labelStyle}>
                3D model
                <input style={inputStyle} type="file" accept=".glb,.gltf,model/gltf-binary" onChange={(event) => setModelFile(event.target.files?.[0] || null)} />
              </label>
              <p style={{ margin: 0, color: "#8ea0c2", fontSize: 13 }}>
                {modelFile?.name || "Attach a GLB or GLTF model for AR try-on."}
              </p>
              {!editingId && (
                <p style={{ margin: 0, color: "#fda4af", fontSize: 12 }}>
                  Required for new products.
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button style={buttonStyle} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save product" : "Create product"}
            </button>
            <button type="button" style={secondaryStyle} onClick={resetForm}>
              Reset form
            </button>
          </div>
        </form>

        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "#8ea7db", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>
              Store snapshot
            </p>
            <h2 style={{ margin: 0 }}>{activeStore?.name || "No active store"}</h2>
            <p style={{ margin: 0, color: "#b8c4de" }}>
              {activeStore?.description || "Products you upload here will appear in your storefront and AR flows."}
            </p>
          </div>

          <div style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", minHeight: 170 }}>
              <img
                src={getProductImageSrc({ name: form.name || "Preview product", arCategory: form.arCategory, images: [] })}
                alt="Product preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", background: "#0c1119" }}
                onError={handleImageError}
              />
              <div style={{ padding: 18, display: "grid", gap: 10 }}>
                <strong style={{ fontSize: 20 }}>{form.name || "Live product preview"}</strong>
                <p style={{ margin: 0, color: "#aab6d0", lineHeight: 1.5 }}>
                  {form.description || "Your product summary will show up here while you edit the form."}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ padding: "7px 10px", borderRadius: 999, background: "rgba(93, 139, 255, 0.14)", color: "#a9c3ff", fontSize: 12 }}>
                    {formatStatus(form.category || "category")}
                  </span>
                  <span style={{ padding: "7px 10px", borderRadius: 999, background: "rgba(138, 92, 255, 0.14)", color: "#c4b5fd", fontSize: 12 }}>
                    AR: {formatStatus(form.arCategory || "glasses")}
                  </span>
                  <span style={{ padding: "7px 10px", borderRadius: 999, background: "rgba(74, 222, 128, 0.12)", color: "#86efac", fontSize: 12 }}>
                    Stock {form.stock || "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 16, display: "grid", gap: 10 }}>
            <span style={{ color: "#8ea7db", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Quick notes</span>
            <p style={{ margin: 0, color: "#b8c4de" }}>Use matching category and AR category values so search, try-on, and generated artwork all stay aligned.</p>
            <p style={{ margin: 0, color: "#b8c4de" }}>For edits, uploading new files appends fresh assets while keeping existing product data unless you replace those fields.</p>
          </div>
        </section>
      </section>
      )}

      {activeView === "products" && (
      <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "#8ea7db", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>
              Product library
            </p>
            <h2 style={{ margin: 0 }}>Browse and edit your catalog</h2>
          </div>
          <label style={{ ...labelStyle, minWidth: 280 }}>
            Search products
            <input style={inputStyle} placeholder="Search by name, category, AR category..." value={productQuery} onChange={(event) => setProductQuery(event.target.value)} />
          </label>
        </div>

        {loading ? (
          <p style={{ margin: 0, color: "#b8c4de" }}>Loading products...</p>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {paginatedProducts.map((product) => (
                <article key={product._id} style={{ ...cardStyle, overflow: "hidden", display: "grid" }}>
                  <img
                    src={getProductImageSrc(product)}
                    alt={product.name}
                    style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", background: "#0c1119" }}
                    onError={handleImageError}
                  />
                  <div style={{ padding: 16, display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <strong style={{ fontSize: 18 }}>{product.name}</strong>
                      <p style={{ margin: 0, color: "#8ea0c2", lineHeight: 1.5 }}>
                        {product.description?.slice(0, 110) || "No description yet."}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(93, 139, 255, 0.14)", color: "#a9c3ff", fontSize: 12 }}>
                        {product.category}
                      </span>
                      <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(138, 92, 255, 0.14)", color: "#c4b5fd", fontSize: 12 }}>
                        AR {product.arCategory}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#dce4f9" }}>
                      <span>${Number(product.price).toFixed(2)}</span>
                      <span>Stock {product.stock}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button style={buttonStyle} onClick={() => startEdit(product)}>
                        Edit
                      </button>
                      <button style={dangerStyle} onClick={() => removeProduct(product._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredProducts.length > productsPerPage && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <p style={{ margin: 0, color: "#aab6d0" }}>
                  Showing {(productPage - 1) * productsPerPage + 1}-{Math.min(productPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    style={secondaryStyle}
                    disabled={productPage === 1}
                    onClick={() => setProductPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </button>
                  <span
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "rgba(38, 48, 68, 0.88)",
                      color: "#dce4f9",
                      minWidth: 92,
                      textAlign: "center",
                      fontWeight: 700
                    }}
                  >
                    {productPage} / {totalProductPages}
                  </span>
                  <button
                    type="button"
                    style={secondaryStyle}
                    disabled={productPage === totalProductPages}
                    onClick={() => setProductPage((current) => Math.min(totalProductPages, current + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      )}

      {activeView === "orders" && (
      <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <p style={{ margin: 0, color: "#8ea7db", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>
            Order queue
          </p>
          <h2 style={{ margin: 0 }}>Keep fulfillment moving</h2>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {orders.map((order) => {
            const statusStyle = getStatusStyle(order.status);

            return (
              <div
                key={order._id}
                style={{
                  ...cardStyle,
                  padding: 18,
                  display: "grid",
                  gap: 14,
                  gridTemplateColumns: "minmax(0, 1.2fr) minmax(220px, 0.8fr)"
                }}
              >
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                    <strong style={{ fontSize: 16 }}>Order {order._id.slice(-8).toUpperCase()}</strong>
                    <span
                      style={{
                        padding: "7px 11px",
                        borderRadius: 999,
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        fontSize: 12,
                        fontWeight: 800
                      }}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#dce4f9", fontWeight: 700 }}>${Number(order.total).toFixed(2)}</p>
                  <p style={{ margin: 0, color: "#aab6d0", lineHeight: 1.6 }}>
                    {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                  </p>
                </div>
                <div style={{ display: "grid", alignContent: "start", gap: 8 }}>
                  <label style={labelStyle}>
                    Update status
                    <select value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)} style={inputStyle}>
                      {["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"].map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      )}
    </section>
  );
}
