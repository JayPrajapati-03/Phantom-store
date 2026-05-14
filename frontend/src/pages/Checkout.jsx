import React, { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { getRazorpayErrorMessage, loadRazorpayCheckout } from "../utils/razorpay.js";
import { useCartStore } from "../store/cartStore.js";
import { useAuthStore } from "../store/authStore.js";

const normalizeKey = (value) => String(value || "").trim();

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart, replaceItems } = useCartStore();
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const paymentInProgress = useRef(false);
  const razorpayRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (razorpayRef.current?.close) {
        razorpayRef.current.close();
      }

      razorpayRef.current = null;
      paymentInProgress.current = false;
    };
  }, []);

  const releaseCheckoutLock = useCallback(() => {
    paymentInProgress.current = false;
    razorpayRef.current = null;

    if (mountedRef.current) {
      setLoading(false);
    }
  }, []);

  const checkout = useCallback(async () => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (paymentInProgress.current) return;

    paymentInProgress.current = true;
    setLoading(true);
    let settled = false;
    let paymentFailed = false;

    const finishOnce = () => {
      if (settled) return;
      settled = true;
      releaseCheckoutLock();
    };

    try {
      if (!items.length) {
        toast.error("Your cart is empty.");
        finishOnce();
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
        finishOnce();
        navigate("/cart");
        return;
      }

      const checkoutAmount = validItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );

      const Razorpay = await loadRazorpayCheckout();

      const { data } = await api.post("/payment/create-order", {
        amount: Math.round(checkoutAmount * 100),
        currency: "INR",
        items: validItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity
        }))
      });

      if (!data?.key || !data?.orderId || !data?.amount || !data?.currency) {
        throw new Error("Payment order response is incomplete");
      }

      const backendKey = normalizeKey(data.key);

      const options = {
        key: backendKey,
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
            if (!response?.razorpay_order_id || !response?.razorpay_payment_id || !response?.razorpay_signature) {
              throw new Error("Razorpay returned an incomplete payment response");
            }

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
              finishOnce();
              toast.success("Payment successful!");
              navigate("/confirmed");
            } else {
              toast.error("Payment verification failed. Please contact support.");
              finishOnce();
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error(
              getRazorpayErrorMessage(err, "Payment verification failed. Please contact support.")
            );
            finishOnce();
          }
        },
        modal: {
          ondismiss: () => {
            if (!settled) {
              if (!paymentFailed) {
                toast("Payment cancelled", { icon: "i" });
              }
              finishOnce();
            }
          }
        }
      };

      if (!options.key) {
        throw new Error("Razorpay key is missing from the frontend configuration.");
      }

      const rzp = new Razorpay(options);
      razorpayRef.current = rzp;

      rzp.on("payment.failed", (response) => {
        paymentFailed = true;
        console.error("Razorpay payment failed:", response?.error || response);
        toast.error(getRazorpayErrorMessage(response, "Payment failed. Please try again."));
      });

      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(getRazorpayErrorMessage(err, "Could not initiate payment. Please try again."));
      finishOnce();
    }
  }, [token, items, clearCart, replaceItems, navigate, user, releaseCheckoutLock]);

  if (!user || user.role !== "customer") {
    return <Navigate to="/login" replace />;
  }

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
