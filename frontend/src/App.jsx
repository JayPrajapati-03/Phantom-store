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
import OrderConfirmed from "./pages/OrderConfirmed.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import TryOn from "./pages/TryOn.jsx";

const shellStyle = {
  minHeight: "100vh",
  background: "#0b0d12",
  color: "#f5f7fb",
  fontFamily: "Inter, ui-sans-serif, system-ui, Arial, sans-serif"
};

const mainStyle = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: 24
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={shellStyle}>
        <Navbar />
        <main style={mainStyle}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/try-on/:id" element={<TryOn />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmed" element={<OrderConfirmed />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}
