import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useAuthStore } from "../store/authStore.js";
import { useCartStore } from "../store/cartStore.js";
import { useStyleSuggestion } from "../ai/useStyleSuggestion.js";
import ProductGrid from "../components/ProductGrid.jsx";
import { getProductImageSrc, getCategoryLabel, handleImageError } from "../utils/productImages.js";

export default function ProductDetail() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const { suggestions, reason, loading, getSuggestions } = useStyleSuggestion();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  useEffect(() => {
    if (!product?._id) return;
    getSuggestions(product._id, product.category).catch(() => {});
  }, [getSuggestions, product]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images.map((item) => item.url) : [getProductImageSrc(product)];
  }, [product]);

  if (!product) {
    return (
      <div style={{ display: "grid", gap: 24, animation: "fadeIn 0.5s var(--ease-out)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 32 }}>
          <div style={{
            aspectRatio: "4/3", borderRadius: "var(--radius-lg)", overflow: "hidden",
            background: "linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%)",
            backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite"
          }} />
          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <div style={{ height: 32, width: "60%", borderRadius: 8, background: "var(--bg-elevated)" }} />
            <div style={{ height: 24, width: "30%", borderRadius: 6, background: "var(--bg-elevated)" }} />
            <div style={{ height: 80, borderRadius: 8, background: "var(--bg-elevated)" }} />
          </div>
        </div>
      </div>
    );
  }

  const displaySrc = images[imageIndex] || getProductImageSrc(product);
  // Skip picsum URLs for display
  const safeSrc = displaySrc.includes("picsum.photos") ? getProductImageSrc(product) : displaySrc;

  return (
    <section style={{ display: "grid", gap: "var(--space-2xl)", animation: "fadeInUp 0.5s var(--ease-out)" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", gap: 8, fontSize: "0.875rem", color: "var(--text-muted)" }}>
        <Link to="/" style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}>Home</Link>
        <span>›</span>
        <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
      </nav>

      {/* Product layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 420px)",
        gap: "var(--space-xl)"
      }}>
        {/* Images */}
        <section style={{ display: "grid", gap: 12 }}>
          <div style={{
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-md)"
          }}>
            <img
              src={safeSrc}
              alt={product.name}
              style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }}
              onError={handleImageError}
            />
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
              {images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  onClick={() => setImageIndex(index)}
                  style={{
                    padding: 2,
                    border: imageIndex === index ? "2px solid var(--accent)" : "2px solid transparent",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s var(--ease-out)",
                    opacity: imageIndex === index ? 1 : 0.6
                  }}
                >
                  <img src={src.includes("picsum.photos") ? getProductImageSrc(product) : src} alt={`${product.name} ${index + 1}`} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} onError={handleImageError} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        <section className="glass" style={{ padding: "var(--space-lg)", display: "grid", gap: 16, alignContent: "start" }}>
          <span className="badge badge-accent">{getCategoryLabel(product)}</span>
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>{product.name}</h1>
          <p style={{
            fontSize: "1.75rem", fontWeight: 800, margin: 0,
            background: "linear-gradient(135deg, var(--accent-light), #818cf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            ${Number(product.price).toFixed(2)}
          </p>
          <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>{product.description}</p>
          <p style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.875rem",
            fontWeight: 600,
            color: product.stock > 0 ? "var(--success)" : "var(--error)"
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: product.stock > 0 ? "var(--success)" : "var(--error)"
            }} />
            {product.stock > 0 ? `In stock · ${product.stock} available` : "Out of stock"}
          </p>
          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            <Link to={`/try-on/${product._id}`} className="btn btn-primary" style={{ justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Try On in AR
            </Link>
            {user?.role === "customer" && (
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "center" }}
                onClick={() => { addItem(product); toast.success("Added to cart"); }}
              >
                Add to Cart
              </button>
            )}
          </div>
        </section>
      </div>

      {/* AI Suggestions */}
      <section style={{ display: "grid", gap: "var(--space-md)" }}>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>AI Style Suggestions</div>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            {loading ? "Finding complementary picks..." : reason || "Pairs well with these products."}
          </p>
        </div>
        <ProductGrid products={suggestions} />
      </section>
    </section>
  );
}
