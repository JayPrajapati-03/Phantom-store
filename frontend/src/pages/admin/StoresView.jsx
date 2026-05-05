import React from "react";
import { panelStyle, inputStyle, labelStyle, buttonStyle } from "./adminStyles.js";

export default function StoresView({ stores, merchants, storeForm, setStoreForm, createStore, creatingStore, selectedStoreId, setSelectedStoreId }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{
        ...panelStyle, padding: 28,
        background: "radial-gradient(circle at top right, rgba(74,222,128,0.15), transparent 32%), linear-gradient(180deg, rgba(16,21,31,0.96), rgba(11,14,22,0.98))"
      }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "#86efac", fontSize: 12 }}>Store management</p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>Create & manage stores</h1>
          <p style={{ margin: 0, color: "#b8c4de", maxWidth: 620 }}>
            Create storefronts and assign them to merchants for catalog management.
          </p>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1.2fr)", gap: 24 }}>
        {/* Create Store Form */}
        <form onSubmit={createStore} style={{ ...panelStyle, padding: 24, display: "grid", gap: 18, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "#86efac", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>New store</p>
            <h2 style={{ margin: 0 }}>Create and assign a store</h2>
            <p style={{ margin: 0, color: "#b8c4de" }}>
              Pick a merchant owner and create a storefront.
            </p>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <label style={labelStyle}>
              Store name
              <input style={inputStyle} placeholder="Phantom Signature Store" value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} />
            </label>
            <label style={labelStyle}>
              Assigned merchant
              <select style={inputStyle} value={storeForm.ownerId}
                onChange={(e) => setStoreForm({ ...storeForm, ownerId: e.target.value })}>
                <option value="">Select merchant</option>
                {merchants.map((m) => (
                  <option key={m._id} value={m._id}>{m.name} · {m.email}</option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              Description
              <textarea style={{ ...inputStyle, minHeight: 108, resize: "vertical" }} placeholder="Describe what this store offers."
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })} />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <button style={buttonStyle} disabled={creatingStore || !merchants.length}>
              {creatingStore ? "Creating..." : "Create store"}
            </button>
            <span style={{ color: "#8ea0c2", fontSize: 13 }}>
              {merchants.length ? "Assign stores to merchants." : "Create a merchant first."}
            </span>
          </div>
        </form>

        {/* Store List */}
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 16, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "#86efac", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>Active stores</p>
            <h2 style={{ margin: 0 }}>All stores ({stores.length})</h2>
          </div>

          {stores.length === 0 ? (
            <p style={{ margin: 0, color: "#8ea0c2" }}>No stores yet. Create one to get started.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {stores.map((s) => (
                <div key={s._id} style={{
                  border: selectedStoreId === s._id ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(92,111,150,0.2)",
                  borderRadius: 16, background: "rgba(18,23,34,0.92)", padding: 16,
                  display: "grid", gap: 6, cursor: "pointer", transition: "all 0.2s ease"
                }}
                onClick={() => setSelectedStoreId(s._id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <strong style={{ fontSize: 16 }}>{s.name}</strong>
                    {selectedStoreId === s._id && (
                      <span style={{
                        padding: "5px 10px", borderRadius: 999,
                        background: "rgba(74,222,128,0.14)", color: "#86efac", fontSize: 11, fontWeight: 700
                      }}>Active</span>
                    )}
                  </div>
                  <span style={{ color: "#8ea0c2", fontSize: 13 }}>{s.description || "No description"}</span>
                  <span style={{ color: "#657ba8", fontSize: 12 }}>
                    Owner: {merchants.find((m) => m._id === (s.owner?._id || s.owner))?.name || s.owner?._id || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
