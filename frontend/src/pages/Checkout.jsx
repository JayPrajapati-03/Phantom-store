import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useCartStore } from "../store/cartStore.js";
import { useAuthStore } from "../store/authStore.js";

const buttonStyle = {
  border: "0",
  borderRadius: 10,
  background: "#7c5cff",
  color: "#fff",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { token } = useAuthStore();

  const checkout = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    const payment = await api.post("/payment/create-payment-intent", {
      amount: Math.round(total() * 100),
      currency: "usd"
    });

    await api.post("/orders", {
      stripePaymentId: payment.data.paymentIntentId,
      items: items.map((item) => ({ productId: item._id, quantity: item.quantity }))
    });

    clearCart();
    navigate("/confirmed");
  };

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0 }}>Checkout</h1>
      <p style={{ margin: 0, color: "#abb7ce" }}>Total due: ${total().toFixed(2)}</p>
      <button style={buttonStyle} disabled={!items.length} onClick={checkout}>
        Create payment intent
      </button>
    </section>
  );
}
