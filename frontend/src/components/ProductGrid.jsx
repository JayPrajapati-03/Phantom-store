import React from "react";
import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-3xl) var(--space-lg)",
        gap: 16,
        color: "var(--text-muted)"
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <p style={{ fontSize: "1rem", fontWeight: 500 }}>No products found</p>
        <p style={{ fontSize: "0.875rem" }}>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div
      className="stagger-in"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "var(--space-lg)"
      }}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
