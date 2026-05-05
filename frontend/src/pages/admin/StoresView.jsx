import React from "react";
import { panelStyle, inputStyle, labelStyle, buttonStyle } from "./adminStyles.js";

export default function StoresView({ stores, merchants, storeForm, setStoreForm, createStore, creatingStore, selectedStoreId, setSelectedStoreId }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ ...panelStyle, padding: 28 }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--success)", fontSize: 12, fontWeight: 700 }}>Store management</p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>Create & manage stores</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", maxWidth: 620 }}>
            Create storefronts and assign them to merchants for catalog management.
          </p>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1.2fr)", gap: 24 }}>
        {/* Create Store Form */}
        <form onSubmit={createStore} style={{ ...panelStyle, padding: 24, display: "grid", gap: 18, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12, fontWeight: 700 }}>New store</p>
            <h2 style={{ margin: 0 }}>Create and assign a store</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
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
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {merchants.length ? "Assign stores to merchants." : "Create a merchant first."}
            </span>
          </div>
        </form>

        {/* Store List */}
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 16, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12, fontWeight: 700 }}>Active stores</p>
            <h2 style={{ margin: 0 }}>All stores ({stores.length})</h2>
          </div>

          {stores.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted)" }}>No stores yet. Create one to get started.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {stores.map((s) => (
                <div key={s._id} style={{
                  border: selectedStoreId === s._id ? "1px solid var(--accent)" : "1px solid var(--border-light)",
                  borderRadius: 16, background: "var(--bg-elevated)", padding: 16,
                  display: "grid", gap: 6, cursor: "pointer", transition: "all 0.2s ease"
                }}
                onClick={() => setSelectedStoreId(s._id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <strong style={{ fontSize: 16 }}>{s.name}</strong>
                    {selectedStoreId === s._id && (
                      <span style={{
                        padding: "5px 10px", borderRadius: 999,
                        background: "rgba(52, 211, 153, 0.12)", color: "var(--success)", fontSize: 11, fontWeight: 700
                      }}>Active</span>
                    )}
                  </div>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{s.description || "No description"}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
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
