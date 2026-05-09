import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useAuthStore } from "../store/authStore.js";
import ProductsView from "./admin/ProductsView.jsx";
import MerchantDashboardView from "./merchant/MerchantDashboardView.jsx";
import MerchantStoresView from "./merchant/MerchantStoresView.jsx";

const emptyStoreForm = { name: "", description: "" };

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: "DB" },
  { key: "store", label: "Stores", icon: "ST" },
  { key: "products", label: "Products", icon: "PR" }
];

export default function MerchantPanel() {
  const { user } = useAuthStore();
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingStore, setCreatingStore] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [storeForm, setStoreForm] = useState(emptyStoreForm);

  const activeStoreId = selectedStoreId || stores[0]?._id || "";
  const activeStore = useMemo(
    () => stores.find((store) => store._id === activeStoreId) || stores[0] || null,
    [activeStoreId, stores]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const storesRes = await api.get("/stores/my");
      const myStores = storesRes.data.stores || [];
      setStores(myStores);
      setSelectedStoreId((current) => current || myStores[0]?._id || "");

      if (myStores.length > 0) {
        const productResponses = await Promise.all(
          myStores.map((store) =>
            api.get("/products", {
              params: { storeId: store._id, limit: 1000 }
            })
          )
        );
        const mergedProducts = productResponses.flatMap((response) => response.data.products || []);
        const uniqueProducts = Array.from(
          new Map(mergedProducts.map((product) => [product._id, product])).values()
        );
        setProducts(uniqueProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load merchant data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  const createStore = async (event) => {
    event.preventDefault();
    if (!String(storeForm.name || "").trim()) {
      toast.error("Store name is required");
      return;
    }

    try {
      setCreatingStore(true);
      const res = await api.post("/stores", storeForm);
      const newStore = res.data.store;
      setStores((current) => [newStore, ...current]);
      setSelectedStoreId(newStore?._id || "");
      setStoreForm(emptyStoreForm);
      toast.success("Store created");
      loadData().catch(() => {});
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create store");
    } finally {
      setCreatingStore(false);
    }
  };

  const totalInventoryValue = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0),
    [products]
  );

  const lowStockCount = useMemo(
    () => products.filter((product) => Number(product.stock || 0) <= 5).length,
    [products]
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>Loading merchant data...</p>
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return (
          <MerchantDashboardView
            user={user}
            stores={stores}
            products={products}
            activeStore={activeStore}
            totalInventoryValue={totalInventoryValue}
            lowStockCount={lowStockCount}
            setActiveView={setActiveView}
          />
        );
      case "store":
        return (
          <MerchantStoresView
            user={user}
            stores={stores}
            activeStoreId={activeStoreId}
            setSelectedStoreId={setSelectedStoreId}
            storeForm={storeForm}
            setStoreForm={setStoreForm}
            createStore={createStore}
            creatingStore={creatingStore}
            products={products}
          />
        );
      case "products":
        return (
          <ProductsView
            products={products}
            stores={stores}
            activeStoreId={activeStoreId}
            selectedStoreId={selectedStoreId}
            setSelectedStoreId={setSelectedStoreId}
            saving={saving}
            setSaving={setSaving}
            loadData={loadData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: sidebarCollapsed ? "72px 1fr" : "240px 1fr",
        minHeight: "100vh",
        transition: "grid-template-columns 0.3s ease"
      }}
    >
      <aside
        style={{
          background: "var(--bg-primary)",
          borderRight: "1px solid var(--border-light)",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 10
        }}
      >
        <div
          style={{
            padding: sidebarCollapsed ? "12px 8px 20px" : "12px 20px 20px",
            borderBottom: "1px solid var(--border-light)",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            gap: 8
          }}
        >
          {!sidebarCollapsed && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "0.04em"
              }}
            >
              Merchant
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((current) => !current)}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-light)",
              borderRadius: 10,
              color: "var(--text-secondary)",
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1
            }}
          >
            {sidebarCollapsed ? ">" : "<"}
          </button>
        </div>

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
                background: isActive ? "var(--accent-subtle)" : "transparent",
                border: "none",
                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                transition: "all 0.2s ease",
                letterSpacing: "0.01em"
              }}
              onMouseEnter={(event) => {
                if (!isActive) event.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(event) => {
                if (!isActive) event.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 14, minWidth: 24, textAlign: "center" }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        <div
          style={{
            marginTop: "auto",
            padding: sidebarCollapsed ? "16px 8px" : "16px 20px",
            borderTop: "1px solid var(--border-light)"
          }}
        >
          {!sidebarCollapsed && (
            <div style={{ display: "grid", gap: 4 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Stores: {stores.length}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Products: {products.length}
              </span>
            </div>
          )}
        </div>
      </aside>

      <main style={{ padding: 28, overflowY: "auto" }}>{renderContent()}</main>
    </div>
  );
}
