import React from "react";
import { panelStyle, inputStyle, labelStyle, buttonStyle } from "../admin/adminStyles.js";

export default function MerchantStoresView({
  user,
  stores,
  activeStoreId,
  setSelectedStoreId,
  storeForm,
  setStoreForm,
  createStore,
  creatingStore,
  products
}) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ ...panelStyle, padding: 28 }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--success)", fontSize: 12, fontWeight: 700 }}>
            Store management
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>Create and manage your stores</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", maxWidth: 620 }}>
            Build your storefront presence and choose which store is active while you manage products.
          </p>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1.2fr)", gap: 24 }}>
        <form onSubmit={createStore} style={{ ...panelStyle, padding: 24, display: "grid", gap: 18, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12, fontWeight: 700 }}>
              New store
            </p>
            <h2 style={{ margin: 0 }}>Create your storefront</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              This store will be owned by {user?.name || "you"}.
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
              Description
              <textarea
                style={{ ...inputStyle, minHeight: 108, resize: "vertical" }}
                placeholder="Describe what your store offers."
                value={storeForm.description}
                onChange={(event) => setStoreForm({ ...storeForm, description: event.target.value })}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <button style={buttonStyle} disabled={creatingStore}>
              {creatingStore ? "Creating..." : "Create store"}
            </button>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {stores.length ? `${stores.length} store(s) available` : "Create your first store to begin"}
            </span>
          </div>
        </form>

        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 16, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12, fontWeight: 700 }}>
              Your stores
            </p>
            <h2 style={{ margin: 0 }}>Store list ({stores.length})</h2>
          </div>

          {stores.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted)" }}>No stores yet. Create one to get started.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {stores.map((store) => {
                const isActive = activeStoreId === store._id;
                const productCount = products.filter(
                  (product) => String(product.storeId?._id || product.storeId || "") === String(store._id)
                ).length;

                return (
                  <div
                    key={store._id}
                    style={{
                      border: isActive ? "1px solid var(--accent)" : "1px solid var(--border-light)",
                      borderRadius: 16,
                      background: "var(--bg-elevated)",
                      padding: 16,
                      display: "grid",
                      gap: 6,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onClick={() => setSelectedStoreId(store._id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <strong style={{ fontSize: 16 }}>{store.name}</strong>
                      {isActive && (
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: 999,
                            background: "rgba(52, 211, 153, 0.12)",
                            color: "var(--success)",
                            fontSize: 11,
                            fontWeight: 700
                          }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{store.description || "No description"}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Products: {productCount}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
