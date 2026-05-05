import React from "react";
import { panelStyle, inputStyle, labelStyle, buttonStyle, dangerStyle } from "./adminStyles.js";

export default function MerchantsView({ merchants, merchantForm, setMerchantForm, createMerchant, creatingMerchant }) {
  const emptyMerchantForm = { name: "", email: "", password: "" };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{
        ...panelStyle, padding: 28,
        background: "radial-gradient(circle at top right, rgba(138,92,255,0.18), transparent 32%), linear-gradient(180deg, rgba(16,21,31,0.96), rgba(11,14,22,0.98))"
      }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", color: "#b4a7ff", fontSize: 12 }}>Merchant management</p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1.1 }}>Manage merchant accounts</h1>
          <p style={{ margin: 0, color: "#b8c4de", maxWidth: 620 }}>
            Create new merchant accounts and assign them stores for catalog management.
          </p>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1.2fr)", gap: 24 }}>
        {/* Create Merchant Form */}
        <form onSubmit={createMerchant} style={{ ...panelStyle, padding: 24, display: "grid", gap: 18, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "#8ea7db", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>New merchant</p>
            <h2 style={{ margin: 0 }}>Create a merchant account</h2>
            <p style={{ margin: 0, color: "#b8c4de" }}>
              Add a new merchant so you can assign them a store.
            </p>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <label style={labelStyle}>
              Merchant name
              <input style={inputStyle} placeholder="Maya Merchant" value={merchantForm.name}
                onChange={(e) => setMerchantForm({ ...merchantForm, name: e.target.value })} />
            </label>
            <label style={labelStyle}>
              Email
              <input style={inputStyle} type="email" placeholder="merchant@example.com" value={merchantForm.email}
                onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })} />
            </label>
            <label style={labelStyle}>
              Temporary password
              <input style={inputStyle} type="password" placeholder="At least 8 characters" value={merchantForm.password}
                onChange={(e) => setMerchantForm({ ...merchantForm, password: e.target.value })} />
            </label>
          </div>

          <button style={buttonStyle} disabled={creatingMerchant}>
            {creatingMerchant ? "Creating..." : "Create merchant"}
          </button>
        </form>

        {/* Merchant List */}
        <section style={{ ...panelStyle, padding: 24, display: "grid", gap: 16, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: "#8ea7db", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 12 }}>Directory</p>
            <h2 style={{ margin: 0 }}>Registered merchants ({merchants.length})</h2>
          </div>

          {merchants.length === 0 ? (
            <p style={{ margin: 0, color: "#8ea0c2" }}>No merchants yet. Create one to get started.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {merchants.map((m) => (
                <div key={m._id} style={{
                  border: "1px solid rgba(92,111,150,0.2)", borderRadius: 16,
                  background: "rgba(18,23,34,0.92)", padding: 16, display: "grid", gap: 6
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <strong style={{ fontSize: 16 }}>{m.name}</strong>
                    <span style={{
                      padding: "5px 10px", borderRadius: 999,
                      background: "rgba(138,92,255,0.14)", color: "#c4b5fd", fontSize: 11, fontWeight: 700
                    }}>
                      {m.role || "merchant"}
                    </span>
                  </div>
                  <span style={{ color: "#8ea0c2", fontSize: 13 }}>{m.email}</span>
                  <span style={{ color: "#657ba8", fontSize: 12 }}>ID: {m._id}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
