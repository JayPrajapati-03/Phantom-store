import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../components/ProductGrid.jsx";
import { useProductSearch } from "../ai/useProductSearch.js";

const buttonStyle = {
  border: "0",
  borderRadius: 10,
  background: "#7c5cff",
  color: "#fff",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700
};

const inputStyle = {
  width: "100%",
  border: "1px solid #2a3346",
  borderRadius: 10,
  background: "#111722",
  color: "#fff",
  padding: "14px 16px"
};

const filterButton = (active) => ({
  border: "1px solid #2a3346",
  borderRadius: 999,
  background: active ? "#7c5cff" : "#141925",
  color: "#fff",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700
});

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
    if (category === "Glasses") return products.filter((product) => product.arCategory === "glasses");
    if (category === "Shoes") return products.filter((product) => product.arCategory === "shoes");
    return products.filter((product) => ["shirt", "jacket", "hat"].includes(product.arCategory));
  }, [category, products]);

  const submit = (event) => {
    event.preventDefault();
    search(query);
  };

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <section
        style={{
          display: "grid",
          gap: 18,
          padding: 28,
          borderRadius: 18,
          background:
            "radial-gradient(circle at top right, rgba(124,92,255,0.22), transparent 30%), linear-gradient(135deg, #121620, #0b0d12)"
        }}
      >
        <h1 style={{ fontSize: 52, lineHeight: 1.05, margin: 0 }}>Browser-native AR try-on commerce</h1>
        <p style={{ color: "#abb7ce", maxWidth: 700, margin: 0 }}>
          Shop products with 3D previews, AI style support, and camera-based try-on experiences.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" style={buttonStyle} onClick={() => navigate("/try-on/preview")}>
            Try it on
          </button>
        </div>
      </section>

      <form onSubmit={submit} style={{ display: "flex", gap: 10 }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search something like beach wedding, glasses, jackets..."
          style={inputStyle}
        />
        <button style={buttonStyle}>Search</button>
      </form>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["All", "Glasses", "Clothing", "Shoes"].map((label) => (
          <button type="button" key={label} style={filterButton(category === label)} onClick={() => setCategory(label)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <p>Loading products...</p> : <ProductGrid products={filteredProducts} />}
    </section>
  );
}
