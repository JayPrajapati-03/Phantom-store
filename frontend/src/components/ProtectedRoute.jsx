import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuthStore();

  if (!user) {
    // Redirect to admin login if trying to access admin routes
    if (role === "admin") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    if (role === "admin") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
