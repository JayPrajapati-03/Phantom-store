import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { useCartStore } from "../store/cartStore.js";
import { useThemeStore } from "../store/themeStore.js";

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        border: "1px solid var(--border-light)",
        background: "var(--bg-elevated)",
        color: "var(--text-secondary)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s var(--ease-out)",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-hover)";
        e.currentTarget.style.borderColor = "var(--border-focus)";
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.transform = "rotate(15deg) scale(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-elevated)";
        e.currentTarget.style.borderColor = "var(--border-light)";
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { user, isAdmin, isMerchant } = useAuthStore();
  const location = useLocation();
  const cartCount = useCartStore((state) =>
    (Array.isArray(state.items) ? state.items : []).reduce(
      (sum, item) => sum + (item.qty ?? item.quantity ?? 1),
      0
    )
  );
  const [scrolled, setScrolled] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const prevCount = React.useRef(cartCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  // Determine panel link based on role
  const getPanelLink = () => {
    if (isAdmin()) return "/admin";
    if (isMerchant()) return "/merchant";
    return null;
  };

  const getPanelLabel = () => {
    if (isAdmin()) return "Admin";
    if (isMerchant()) return "Merchant";
    return null;
  };

  const panelLink = getPanelLink();
  const panelLabel = getPanelLabel();
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "0 var(--space-lg)",
        transition: "all 0.3s var(--ease-out)",
        background: scrolled
          ? (isLight ? "rgba(245, 246, 250, 0.9)" : "rgba(8, 10, 15, 0.85)")
          : (isLight ? "rgba(245, 246, 250, 0.6)" : "rgba(8, 10, 15, 0.5)"),
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid var(--border-light)" : "1px solid transparent"
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 68
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff",
            boxShadow: "0 2px 12px var(--accent-glow)"
          }}>P</div>
          <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Phantom<span style={{ color: "var(--accent-light)", marginLeft: 4 }}>Store</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link to="/" className="nav-link">
            Home
          </Link>

          {/* Cart — visible for customers or when no user */}
          {user?.role === "customer" && (
            <Link to="/cart" className="nav-link" style={{ position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -14,
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: "var(--accent)", color: "#fff",
                  fontSize: "0.7rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 5px",
                  animation: cartBump ? "countPulse 0.4s var(--ease-spring)" : "none"
                }}>{cartCount}</span>
              )}
            </Link>
          )}

          {/* Role-based panel link — only visible when logged in */}
          {panelLink && (
            <Link to={panelLink} className="nav-link" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isAdmin() ? (
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                ) : (
                  <>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </>
                )}
              </svg>
              {panelLabel}
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {user ? (
            <Link
              to="/logout"
              className="btn btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.875rem" }}
            >
              Logout
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "0.875rem" }}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
