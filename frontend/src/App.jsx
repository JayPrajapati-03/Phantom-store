import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import MerchantPanel from "./pages/MerchantPanel.jsx";
import OrderConfirmed from "./pages/OrderConfirmed.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import TryOn from "./pages/TryOn.jsx";

export default function App() {
  return (
    <BrowserRouter>
      {/* Animated background orbs */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,92,255,0.06) 0%, transparent 70%)",
          top: "-200px",
          right: "-100px",
          animation: "float 20s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
          bottom: "-150px",
          left: "-100px",
          animation: "float 25s ease-in-out infinite reverse"
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Navbar />
        <main className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-3xl)" }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/try-on/:id" element={<TryOn />} />

            {/* Customer */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmed" element={<OrderConfirmed />} />

            {/* Single login — auto-routes based on role */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />

            {/* Admin protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Merchant protected */}
            <Route
              path="/merchant"
              element={
                <ProtectedRoute role="merchant">
                  <MerchantPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#161b28",
            color: "#f0f2f8",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            fontSize: "0.9rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
          }
        }}
      />
    </BrowserRouter>
  );
}
