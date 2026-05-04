import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import ARCanvas from "../ar/ARCanvas.jsx";
import { useStyleSuggestion } from "../ai/useStyleSuggestion.js";
import ProductGrid from "../components/ProductGrid.jsx";
import { useParams } from "react-router-dom";
import { useCartStore } from "../store/cartStore.js";

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
    if (!captureReviewImage) {
      toast.error("AR preview is not ready yet");
      return;
    }

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
      const response = await api.post("/ai/review", {
        imageBase64,
        productName: product.name
      });
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
    <section style={{ display: "grid", gap: 18 }}>
      <h1 style={{ margin: 0 }}>AR Try On</h1>
      <section style={{ display: "grid", gap: 8 }}>
        <label style={{ color: "#abb7ce" }} htmlFor="camera-select">
          Camera source
        </label>
        <select
          id="camera-select"
          value={selectedCameraId}
          onChange={(event) => setSelectedCameraId(event.target.value)}
          style={{
            width: "100%",
            maxWidth: 420,
            border: "1px solid #2a3346",
            borderRadius: 8,
            background: "#111722",
            color: "#fff",
            padding: "12px 14px"
          }}
        >
          {cameraDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
        <p style={{ margin: 0, color: "#abb7ce" }}>
          Active camera: {cameraDevices.find((device) => device.deviceId === activeCameraId)?.label || "Loading camera..."}
        </p>
      </section>
      <div style={{ height: 640, border: "1px solid #263044", borderRadius: 8, overflow: "hidden", background: "#05070b" }}>
        {product ? (
          <ARCanvas
            product={product}
            onCaptureReady={handleCaptureReady}
            preferredDeviceId={selectedCameraId}
            onCameraChange={handleCameraChange}
          />
        ) : (
          <p style={{ padding: 20 }}>Loading AR asset...</p>
        )}
      </div>
      {product && (
        <section
          style={{
            display: "grid",
            gap: 14,
            padding: 16,
            border: "1px solid #252d3d",
            borderRadius: 12,
            background: "#111722"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: 4 }}>
              <strong style={{ fontSize: 18 }}>{product.name}</strong>
              <p style={{ color: "#abb7ce", margin: 0 }}>
                Save your look, add this item to cart, or ask AI for styling feedback.
              </p>
            </div>
            <p style={{ margin: 0, fontWeight: 700 }}>${Number(product.price).toFixed(2)}</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button style={buttonStyle} onClick={saveLook} disabled={!captureReviewImage}>
              Save look
            </button>
            <button style={buttonStyle} onClick={addCurrentProductToCart}>
              Add to cart
            </button>
            <button style={buttonStyle} onClick={getAiReview} disabled={reviewLoading || !captureReviewImage}>
              {reviewLoading ? "Reviewing..." : "Get AI review"}
            </button>
          </div>
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
