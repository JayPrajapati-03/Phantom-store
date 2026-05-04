import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import ARCanvas from "../ar/ARCanvas.jsx";
import { useStyleSuggestion } from "../ai/useStyleSuggestion.js";
import ProductGrid from "../components/ProductGrid.jsx";
import { useParams } from "react-router-dom";
import { useCartStore } from "../store/cartStore.js";

export default function TryOn() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [captureReviewImage, setCaptureReviewImage] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [activeCameraId, setActiveCameraId] = useState("");
  const { suggestions, reason, loading, getSuggestions } = useStyleSuggestion();
  const addItem = useCartStore((state) => state.addItem);

  const handleCaptureReady = useCallback((captureFn) => {
    setCaptureReviewImage(() => captureFn);
  }, []);

  const handleCameraChange = useCallback(({ devices, activeDeviceId }) => {
    setCameraDevices((current) => {
      const next = devices || [];
      if (
        current.length === next.length &&
        current.every((device, index) => device.deviceId === next[index]?.deviceId && device.label === next[index]?.label)
      ) {
        return current;
      }
      return next;
    });

    setActiveCameraId((current) => (current === (activeDeviceId || "") ? current : activeDeviceId || ""));
    setSelectedCameraId((current) => current || activeDeviceId || "");
  }, []);

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

  const saveLook = () => {
    if (!captureReviewImage) { toast.error("AR preview is not ready yet"); return; }
    try {
      const imageUrl = captureReviewImage();
      const link = document.createElement("a");
      link.download = `${product?.name || "my-look"}.jpg`;
      link.href = imageUrl;
      link.click();
    } catch (error) {
      toast.error(error.message || "Unable to save look");
    }
  };

  const addCurrentProductToCart = () => {
    if (!product) return;
    addItem(product);
    toast.success("Added to cart");
  };

  const getAiReview = async () => {
    if (!product || !captureReviewImage) return;
    try {
      setReviewLoading(true);
      const imageBase64 = captureReviewImage();
      const response = await api.post("/ai/review", { imageBase64, productName: product.name });
      setReview({
        score: Number(response.data?.score) || 8,
        tips: Array.isArray(response.data?.tips) && response.data.tips.length
          ? response.data.tips
          : ["The product is visible, but the AR placement may still need tuning."]
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to review outfit");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <section style={{ display: "grid", gap: "var(--space-xl)", animation: "fadeInUp 0.4s var(--ease-out)" }}>
      <div>
        <h1 style={{ margin: "0 0 4px" }}>AR Try On</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>See how it looks on you in real-time</p>
      </div>

      {/* Camera source */}
      <section style={{ display: "grid", gap: 8 }}>
        <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }} htmlFor="camera-select">
          Camera source
        </label>
        <select
          id="camera-select"
          className="select"
          value={selectedCameraId}
          onChange={(e) => setSelectedCameraId(e.target.value)}
          style={{ maxWidth: 420 }}
        >
          {cameraDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem" }}>
          Active: {cameraDevices.find((d) => d.deviceId === activeCameraId)?.label || "Loading camera..."}
        </p>
      </section>

      {/* AR Canvas */}
      <div style={{
        height: 640,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--bg-base)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-lg), 0 0 60px rgba(124,92,255,0.06)"
      }}>
        {product ? (
          <ARCanvas
            product={product}
            onCaptureReady={handleCaptureReady}
            preferredDeviceId={selectedCameraId}
            onCameraChange={handleCameraChange}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            Loading AR asset...
          </div>
        )}
      </div>

      {/* Action bar */}
      {product && (
        <section className="glass-strong" style={{ padding: "var(--space-lg)", display: "grid", gap: "var(--space-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: 4 }}>
              <strong style={{ fontSize: "1.1rem" }}>{product.name}</strong>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.875rem" }}>
                Save your look, add to cart, or ask AI for styling feedback.
              </p>
            </div>
            <p style={{
              margin: 0, fontWeight: 800, fontSize: "1.25rem",
              background: "linear-gradient(135deg, var(--accent-light), #818cf8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>${Number(product.price).toFixed(2)}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={saveLook} disabled={!captureReviewImage}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
              Save look
            </button>
            <button className="btn btn-primary" onClick={addCurrentProductToCart}>
              Add to cart
            </button>
            <button className="btn btn-secondary" onClick={getAiReview} disabled={reviewLoading || !captureReviewImage}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></svg>
              {reviewLoading ? "Reviewing..." : "Get AI review"}
            </button>
          </div>
        </section>
      )}

      {/* AI Review score card */}
      {review && (
        <section className="glass" style={{ padding: "var(--space-lg)", display: "grid", gap: "var(--space-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: `conic-gradient(var(--accent) ${review.score * 10}%, var(--bg-elevated) 0%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", fontWeight: 800, flexShrink: 0
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "var(--bg-surface)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>{review.score}</div>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>AI Outfit Review</h2>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>Score out of 10</p>
            </div>
          </div>
          {!!review.tips?.length && (
            <div style={{ display: "grid", gap: 8 }}>
              {review.tips.map((tip, index) => (
                <p key={`${index}-${tip}`} style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9375rem", paddingLeft: 12, borderLeft: "2px solid var(--accent)" }}>
                  {tip}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Suggestions */}
      <section style={{ display: "grid", gap: "var(--space-md)" }}>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>Pairs well with</div>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9375rem" }}>
            {loading ? "Finding matching products..." : reason || "Suggested complementary items."}
          </p>
        </div>
        <ProductGrid products={suggestions} />
      </section>
    </section>
  );
}
