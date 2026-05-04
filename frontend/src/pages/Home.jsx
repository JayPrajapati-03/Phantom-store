import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../components/ProductGrid.jsx";
import { useProductSearch } from "../ai/useProductSearch.js";

const categoryIcons = {
  All: "⚡",
  Glasses: "👓",
  Clothing: "👔",
  Shoes: "👟"
};

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const { products, loading, search } = useProductSearch();

  useEffect(() => {
    search("").catch(() => {});
  }, [search]);

  const filteredProducts = useMemo(() => {
    if (category === "All") return products;
    if (category === "Glasses") return products.filter((p) => p.arCategory === "glasses");
    if (category === "Shoes") return products.filter((p) => p.arCategory === "shoes");
    return products.filter((p) => ["shirt", "jacket", "hat"].includes(p.arCategory));
  }, [category, products]);

  const submit = (e) => {
    e.preventDefault();
    search(query);
  };

  return (
    <section style={{ display: "grid", gap: "var(--space-2xl)" }}>
      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          padding: "60px 40px",
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(135deg, rgba(124,92,255,0.12) 0%, rgba(8,10,15,0.95) 50%, rgba(99,102,241,0.08) 100%)",
          border: "1px solid var(--border-light)",
          overflow: "hidden"
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -60, right: -60, width: 240, height: 240,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,255,0.15), transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: "30%", width: 180, height: 180,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 20, maxWidth: 680 }}>
          <div className="badge badge-accent" style={{ justifySelf: "flex-start" }}>
            ✦ AR-Powered Shopping
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            Browser-native
            <br />
            <span style={{
              background: "linear-gradient(135deg, var(--accent-light), #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              AR try-on
            </span>{" "}
            commerce
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 560 }}>
            Shop products with 3D previews, AI style support, and camera-based try-on experiences.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            <button
              className="btn btn-primary"
              style={{ padding: "14px 28px", fontSize: "1rem" }}
              onClick={() => navigate("/try-on/preview")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Try it on
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: "14px 28px", fontSize: "1rem" }}
              onClick={() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              Browse collection
            </button>
          </div>
        </div>
      </section>

      {/* ── Search ── */}
      <form onSubmit={submit} style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search something like beach wedding, glasses, jackets..."
            style={{ paddingLeft: 44 }}
          />
        </div>
        <button className="btn btn-primary" style={{ padding: "13px 24px" }}>Search</button>
      </form>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["All", "Glasses", "Clothing", "Shoes"].map((label) => (
          <button
            type="button"
            key={label}
            className={`filter-pill${category === label ? " active" : ""}`}
            onClick={() => setCategory(label)}
          >
            {categoryIcons[label]} {label}
          </button>
        ))}
      </div>

      {/* ── Products ── */}
      <section id="products-section" style={{ display: "grid", gap: "var(--space-lg)" }}>
        <div className="section-label">Featured Products</div>
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "var(--space-lg)"
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden"
              }}>
                <div style={{
                  aspectRatio: "4/3",
                  background: "linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite"
                }} />
                <div style={{ padding: 16, display: "grid", gap: 8 }}>
                  <div style={{ height: 16, borderRadius: 4, background: "var(--bg-elevated)", width: "70%" }} />
                  <div style={{ height: 14, borderRadius: 4, background: "var(--bg-elevated)", width: "40%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </section>
    </section>
  );
}
