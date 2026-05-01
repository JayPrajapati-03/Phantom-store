import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import ARCanvas from "../ar/ARCanvas.jsx";
import { useStyleSuggestion } from "../ai/useStyleSuggestion.js";
import ProductGrid from "../components/ProductGrid.jsx";
import { useParams } from "react-router-dom";

const buttonStyle = {
  border: "0",
  borderRadius: 10,
  background: "#7c5cff",
  color: "#fff",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700
};

export default function TryOn() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [captureReviewImage, setCaptureReviewImage] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const { suggestions, reason, loading, getSuggestions } = useStyleSuggestion();

  useEffect(() => {
    if (id === "preview") {
      api.get("/products?limit=1").then((res) => setProduct(res.data.products?.[0] || null));
      return;
    }

    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  useEffect(() => {
    if (!product?._id) return;
    getSuggestions(product._id, product.category).catch(() => {});
  }, [getSuggestions, product]);

  const getAiReview = async () => {
    if (!product || !captureReviewImage) return;

    try {
      setReviewLoading(true);
      const imageBase64 = captureReviewImage();
      const response = await api.post("/ai/review", {
        imageBase64,
        productName: product.name
      });
      setReview(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to review outfit");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <h1 style={{ margin: 0 }}>AR Try On</h1>
      <div style={{ height: 640, border: "1px solid #263044", borderRadius: 8, overflow: "hidden", background: "#05070b" }}>
        {product ? <ARCanvas product={product} onCaptureReady={setCaptureReviewImage} /> : <p style={{ padding: 20 }}>Loading AR asset...</p>}
      </div>
      {product && (
        <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p style={{ color: "#abb7ce", margin: 0 }}>Capture your look and ask AI for styling feedback.</p>
          <button style={buttonStyle} onClick={getAiReview} disabled={reviewLoading || !captureReviewImage}>
            {reviewLoading ? "Reviewing..." : "Get AI review"}
          </button>
        </section>
      )}
      {review && (
        <section style={{ background: "#141925", border: "1px solid #252d3d", borderRadius: 8, padding: 16, display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0 }}>AI outfit review</h2>
          <p style={{ margin: 0 }}>Score: {review.score}/10</p>
          {!!review.tips?.length && review.tips.map((tip, index) => <p key={`${index}-${tip}`} style={{ margin: 0, color: "#abb7ce" }}>{index + 1}. {tip}</p>)}
        </section>
      )}
      <section style={{ display: "grid", gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 8 }}>Pairs well with...</h2>
          <p style={{ color: "#abb7ce", margin: 0 }}>{loading ? "Finding matching products..." : reason || "Suggested complementary items."}</p>
        </div>
        <ProductGrid products={suggestions} />
      </section>
    </section>
  );
}
