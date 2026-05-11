import React, { useCallback, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useCartStore } from "../store/cartStore.js";
import { useAuthStore } from "../store/authStore.js";

let razorpayScriptPromise = null;

function loadRazorpayScript() {
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== "undefined") {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Failed to load Razorpay SDK"));
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart, replaceItems } = useCartStore();
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const paymentInProgress = useRef(false);

  if (!user || user.role !== "customer") {
    return <Navigate to="/login" replace />;
  }

  const checkout = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (paymentInProgress.current) return;

    paymentInProgress.current = true;
    setLoading(true);

    try {
      if (!items.length) {
        toast.error("Your cart is empty.");
        paymentInProgress.current = false;
        setLoading(false);
        return;
      }

      const productResults = await Promise.allSettled(
        items.map((item) => api.get(`/products/${item._id}`))
      );

      const validItems = [];
      const missingItems = [];

      productResults.forEach((result, index) => {
        const cartItem = items[index];

        if (result.status !== "fulfilled" || !result.value?.data?.product) {
          missingItems.push(cartItem);
          return;
        }

        const product = result.value.data.product;
        const quantity = Math.max(Number(cartItem.quantity ?? cartItem.qty) || 1, 1);

        validItems.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images || [],
          modelUrl: product.modelUrl,
          arCategory: product.arCategory,
          qty: quantity,
          quantity
        });
      });

      if (missingItems.length > 0) {
        replaceItems(validItems);

        toast.error("Some cart items were no longer available. Please review your cart and try again.");
        paymentInProgress.current = false;
        setLoading(false);
        navigate("/cart");
        return;
      }

      const checkoutAmount = validItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );

      await loadRazorpayScript();

      const { data } = await api.post("/payment/create-order", {
        amount: Math.round(checkoutAmount * 100),
        currency: "INR",
        items: validItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity
        }))
      });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Phantom Store",
        description: `Order - ${validItems.length} item${validItems.length !== 1 ? "s" : ""}`,
        prefill: {
          name: user.name || "",
          email: user.email || ""
        },
        theme: {
          color: "#7c5cff"
        },
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: validItems.map((item) => ({
                productId: item._id,
                quantity: item.quantity
              }))
            });

            if (verifyRes.data.success) {
              clearCart();
              toast.success("Payment successful!");
              navigate("/confirmed");
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error(
              err.response?.data?.message || "Payment verification failed. Please contact support."
            );
          } finally {
            paymentInProgress.current = false;
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            paymentInProgress.current = false;
            setLoading(false);
            toast("Payment cancelled", { icon: "i" });
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        paymentInProgress.current = false;
        setLoading(false);
        toast.error(response.error?.description || "Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.response?.data?.message || "Could not initiate payment. Please try again.");
      paymentInProgress.current = false;
      setLoading(false);
    }
  }, [token, items, total, clearCart, replaceItems, navigate, user]);

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-xl)",
        paddingTop: "var(--space-2xl)",
        animation: "fadeInUp 0.4s var(--ease-out)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="badge badge-accent">Cart ✓</span>
        <div style={{ width: 40, height: 2, background: "var(--accent)" }} />
        <span className="badge badge-accent" style={{ background: "var(--accent)", color: "#fff" }}>
          Checkout
        </span>
        <div style={{ width: 40, height: 2, background: "var(--border-light)" }} />
        <span className="badge" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
          Confirmed
        </span>
      </div>

      <div
        className="glass-strong"
        style={{
          width: "100%",
          maxWidth: 500,
          padding: "var(--space-xl)",
          display: "grid",
          gap: "var(--space-lg)",
          textAlign: "center"
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: "1.5rem" }}>Order Summary</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            {items.length} item{items.length !== 1 ? "s" : ""} ready for purchase
          </p>
        </div>

        <div
          style={{
            padding: "var(--space-lg)",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", margin: "0 0 4px" }}>Total due</p>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(135deg, var(--accent-light), #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Rs. {total().toFixed(2)}
          </p>
        </div>

        <button
          className="btn btn-primary"
          disabled={!items.length || loading}
          onClick={checkout}
          style={{
            justifyContent: "center",
            padding: "14px 28px",
            fontSize: "1rem",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Confirm & Pay
            </>
          )}
        </button>

        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.75rem" }}>
          Secured by Razorpay · 256-bit encryption
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
