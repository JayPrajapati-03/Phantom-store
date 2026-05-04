import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore.js";
import { getProductImageSrc, getCategoryLabel } from "../utils/productImages.js";

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <article className="product-card">
      <div className="product-img-wrap">
        <img
          src={getProductImageSrc(product)}
          alt={product.name}
          loading="lazy"
        />
        <span className="category-badge badge badge-accent">
          {getCategoryLabel(product)}
        </span>
        <div className="product-overlay">
          <Link
            to={`/try-on/${product._id}`}
            className="btn btn-primary"
            style={{ fontSize: "0.8rem", padding: "8px 14px" }}
          >
            ✦ Try On
          </Link>
          <button
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "8px 14px" }}
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
              toast.success(`${product.name} added to cart`);
            }}
          >
            + Cart
          </button>
        </div>
      </div>
      <Link to={`/products/${product._id}`} style={{ textDecoration: "none" }}>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">${Number(product.price).toFixed(2)}</p>
        </div>
      </Link>
    </article>
  );
}
