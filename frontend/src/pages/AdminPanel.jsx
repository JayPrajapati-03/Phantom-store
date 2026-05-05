import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import DashboardView from "./admin/DashboardView.jsx";
import MerchantsView from "./admin/MerchantsView.jsx";
import StoresView from "./admin/StoresView.jsx";
import ProductsView from "./admin/ProductsView.jsx";
import OrdersView from "./admin/OrdersView.jsx";

const emptyMerchantForm = { name: "", email: "", password: "" };
const emptyStoreForm = { name: "", description: "", ownerId: "" };

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "merchants", label: "Merchants", icon: "👤" },
  { key: "stores", label: "Stores", icon: "🏪" },
  { key: "products", label: "Products", icon: "📦" },
  { key: "orders", label: "Orders", icon: "🛒" },
];

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingMerchant, setCreatingMerchant] = useState(false);
  const [creatingStore, setCreatingStore] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [merchantForm, setMerchantForm] = useState(emptyMerchantForm);
  const [storeForm, setStoreForm] = useState(emptyStoreForm);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeStoreId = selectedStoreId || stores[0]?._id || "";

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, storesRes, merchantsRes] = await Promise.all([
        api.get("/products", { params: { limit: 100 } }),
        api.get("/orders"),
        api.get("/stores", { params: { limit: 20 } }),
        api.get("/auth/merchants")
      ]);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setStores(storesRes.data.stores || []);
      setMerchants(merchantsRes.data.merchants || []);
      setSelectedStoreId((c) => c || (storesRes.data.stores || [])[0]?._id || "");
      setStoreForm((c) => ({ ...c, ownerId: c.ownerId || (merchantsRes.data.merchants || [])[0]?._id || "" }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData().catch(() => {}); }, []);

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
      setMerchants((c) => [newMerchant, ...c]);
      setStoreForm((c) => ({ ...c, ownerId: c.ownerId || newMerchant?._id || "" }));
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
    if (!String(storeForm.name || "").trim()) { toast.error("Store name is required"); return; }
    if (!String(storeForm.ownerId || "").trim()) { toast.error("Select a merchant owner first"); return; }
    try {
      setCreatingStore(true);
      const res = await api.post("/stores", storeForm);
      const newStore = res.data.store;
      setStores((c) => [newStore, ...c]);
      setSelectedStoreId(newStore?._id || "");
      setStoreForm((c) => ({ ...emptyStoreForm, ownerId: c.ownerId }));
      toast.success("Store created");
      loadData().catch(() => {});
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create store");
    } finally {
      setCreatingStore(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders((c) => c.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success("Order status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update order status");
    }
  };

  const totalInventoryValue = useMemo(
    () => products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0),
    [products]
  );
  const pendingOrders = orders.filter((o) => ["pending", "paid", "processing"].includes(o.status)).length;

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <p style={{ color: "#b8c4de", fontSize: 18 }}>Loading admin data...</p>
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return <DashboardView products={products} orders={orders} stores={stores} merchants={merchants}
          totalInventoryValue={totalInventoryValue} pendingOrders={pendingOrders} setActiveView={setActiveView} />;
      case "merchants":
        return <MerchantsView merchants={merchants} merchantForm={merchantForm} setMerchantForm={setMerchantForm}
          createMerchant={createMerchant} creatingMerchant={creatingMerchant} />;
      case "stores":
        return <StoresView stores={stores} merchants={merchants} storeForm={storeForm} setStoreForm={setStoreForm}
          createStore={createStore} creatingStore={creatingStore} selectedStoreId={selectedStoreId} setSelectedStoreId={setSelectedStoreId} />;
      case "products":
        return <ProductsView products={products} stores={stores} activeStoreId={activeStoreId}
          selectedStoreId={selectedStoreId} setSelectedStoreId={setSelectedStoreId}
          saving={saving} setSaving={setSaving} loadData={loadData} />;
      case "orders":
        return <OrdersView orders={orders} updateStatus={updateStatus} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: sidebarCollapsed ? "72px 1fr" : "240px 1fr",
      minHeight: "100vh",
      transition: "grid-template-columns 0.3s ease"
    }}>
      {/* Sidebar */}
      <aside style={{
        background: "linear-gradient(180deg, rgba(12, 16, 24, 0.98), rgba(8, 11, 18, 0.99))",
        borderRight: "1px solid rgba(101, 123, 168, 0.15)",
        padding: "20px 0",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        zIndex: 10
      }}>
        {/* Logo / toggle */}
        <div style={{
          padding: sidebarCollapsed ? "12px 8px 20px" : "12px 20px 20px",
          borderBottom: "1px solid rgba(101, 123, 168, 0.12)",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarCollapsed ? "center" : "space-between",
          gap: 8
        }}>
          {!sidebarCollapsed && (
            <span style={{ fontSize: 16, fontWeight: 800, color: "#dce4f9", letterSpacing: "0.04em" }}>
              ⚡ Admin
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            style={{
              background: "rgba(38, 48, 68, 0.6)",
              border: "1px solid rgba(101, 123, 168, 0.2)",
              borderRadius: 10,
              color: "#8ea7db",
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1
            }}
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav items */}
        {sidebarItems.map((item) => {
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveView(item.key)}
              title={sidebarCollapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: sidebarCollapsed ? "14px 0" : "14px 20px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                background: isActive
                  ? "linear-gradient(90deg, rgba(93, 139, 255, 0.18), transparent)"
                  : "transparent",
                border: "none",
                borderLeft: isActive ? "3px solid #5d8bff" : "3px solid transparent",
                color: isActive ? "#dce4f9" : "#7b8fb8",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                transition: "all 0.2s ease",
                letterSpacing: "0.01em"
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(38, 48, 68, 0.4)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Bottom info */}
        <div style={{ marginTop: "auto", padding: sidebarCollapsed ? "16px 8px" : "16px 20px", borderTop: "1px solid rgba(101, 123, 168, 0.12)" }}>
          {!sidebarCollapsed && (
            <div style={{ display: "grid", gap: 4 }}>
              <span style={{ color: "#657ba8", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Stores: {stores.length}</span>
              <span style={{ color: "#657ba8", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Products: {products.length}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ padding: 28, overflowY: "auto" }}>
        {renderContent()}
      </main>
    </div>
  );
}
