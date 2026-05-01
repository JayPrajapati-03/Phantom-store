import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore.js";
import { getProductImageSrc } from "../utils/productImages.js";

const cardStyle = {
  background: "#141925",
  border: "1px solid #252d3d",
  borderRadius: 8,
  overflow: "hidden"
};

const buttonStyle = {
  border: "0",
  borderRadius: 6,
  background: "#7c5cff",
  color: "#fff",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-block"
};

const secondaryLinkStyle = {
  ...buttonStyle,
  background: "#263044"
};

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <article style={cardStyle}>
      <img
        src={getProductImageSrc(product)}
        alt={product.name}
        style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }}
      />
      <div style={{ padding: 14 }}>
        <h3 style={{ margin: "0 0 8px" }}>{product.name}</h3>
        <p style={{ margin: "0 0 12px", color: "#abb7ce" }}>${Number(product.price).toFixed(2)}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to={`/try-on/${product._id}`} style={buttonStyle}>
            Try On
          </Link>
          <button
            style={secondaryLinkStyle}
            onClick={() => {
              addItem(product);
              toast.success("Added to cart");
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
