import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useCartStore } from "../store/cartStore.js";
import { useStyleSuggestion } from "../ai/useStyleSuggestion.js";
import ProductGrid from "../components/ProductGrid.jsx";
import { getProductImageSrc } from "../utils/productImages.js";

const buttonStyle = {
  border: "0",
  borderRadius: 10,
  background: "#7c5cff",
  color: "#fff",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-block"
};

const secondaryStyle = {
  ...buttonStyle,
  background: "#263044"
};

export default function ProductDetail() {
  const { id } = useParams();
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

  if (!product) return <p>Loading product...</p>;

  return (
    <section style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 420px)", gap: 24 }}>
        <section style={{ display: "grid", gap: 12 }}>
          <img
            src={images[imageIndex] || getProductImageSrc(product)}
            alt={product.name}
            style={{ width: "100%", borderRadius: 14, aspectRatio: "4 / 3", objectFit: "cover" }}
          />
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
              {images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  onClick={() => setImageIndex(index)}
                  style={{
                    padding: 0,
                    border: imageIndex === index ? "2px solid #7c5cff" : "1px solid #2a3346",
                    borderRadius: 10,
                    background: "transparent",
                    cursor: "pointer"
                  }}
                >
                  <img src={src} alt={`${product.name} ${index + 1}`} style={{ width: 90, height: 72, objectFit: "cover", borderRadius: 8 }} />
                </button>
              ))}
            </div>
          )}
        </section>

        <section style={{ display: "grid", gap: 14 }}>
          <h1 style={{ margin: 0 }}>{product.name}</h1>
          <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>${Number(product.price).toFixed(2)}</p>
          <p style={{ color: "#abb7ce", margin: 0 }}>{product.description}</p>
          <p style={{ margin: 0, color: product.stock > 0 ? "#8bd3c7" : "#ff8b8b" }}>
            {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to={`/try-on/${product._id}`} style={buttonStyle}>
              Try On in AR
            </Link>
            <button
              style={secondaryStyle}
              onClick={() => {
                addItem(product);
                toast.success("Added to cart");
              }}
            >
              Add to Cart
            </button>
          </div>
        </section>
      </div>

      <section style={{ display: "grid", gap: 14 }}>
        <div>
          <h2 style={{ marginBottom: 8 }}>AI Style Suggestions</h2>
          <p style={{ margin: 0, color: "#abb7ce" }}>
            {loading ? "Loading complementary picks..." : reason || "Pairs well with these products."}
          </p>
        </div>
        <ProductGrid products={suggestions} />
      </section>
    </section>
  );
}
