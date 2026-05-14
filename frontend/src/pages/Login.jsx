import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useAuthStore } from "../store/authStore.js";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ hidden }) {
  if (hidden) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m2 2 20 20" />
        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
        <path d="M16.68 16.68A10.9 10.9 0 0 1 12 18c-5 0-9-6-9-6a17.8 17.8 0 0 1 4.36-4.95" />
        <path d="M9.88 4.24A10.3 10.3 0 0 1 12 4c5 0 9 6 9 6a18.5 18.5 0 0 1-2.1 2.78" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/auth/login", form);
      const { user, token } = res.data;

      login(user, token);

      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "merchant") {
        navigate("/merchant");
      } else {
        navigate("/");
      }
    } catch {
      setBusy(false);
    }
  };

  return (
    <section className="login-shell" aria-labelledby="login-title">
      <div className="login-showcase" aria-hidden="true">
        <div className="login-showcase__topline">
          <span className="login-kicker">AR commerce workspace</span>
          <span className="login-live-dot">Live</span>
        </div>

        <div className="login-device">
          <div className="login-device__bar">
            <span />
            <span />
            <span />
          </div>
          <div className="login-device__stage">
            <div className="login-scan-frame">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="login-avatar">
              <div className="login-avatar__head" />
              <div className="login-avatar__torso" />
              <div className="login-avatar__arm login-avatar__arm--left" />
              <div className="login-avatar__arm login-avatar__arm--right" />
            </div>
            <div className="login-product-chip login-product-chip--glasses">Glasses fit 98%</div>
            <div className="login-product-chip login-product-chip--jacket">Jacket size M</div>
          </div>
        </div>

        <div className="login-showcase__copy">
          <h2>One sign-in for shoppers, merchants, and admins.</h2>
          <p>Route users into the right workspace with secure access to AR try-on, storefront operations, and platform controls.</p>
        </div>

        <div className="login-metrics">
          <div>
            <strong>3D</strong>
            <span>try-on ready</span>
          </div>
          <div>
            <strong>Role</strong>
            <span>aware routing</span>
          </div>
          <div>
            <strong>Fast</strong>
            <span>checkout flow</span>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="login-card" noValidate>
        <div className="login-brand-mark" aria-hidden="true">P</div>

        <div className="login-heading">
          <span className="login-kicker">Phantom Store</span>
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in once and continue to your customer, merchant, or admin workspace.</p>
        </div>

        <div className="login-field">
          <label htmlFor="email">Email address</label>
          <div className="login-input-wrap">
            <span className="login-input-icon">
              <MailIcon />
            </span>
            <input
              id="email"
              className="input login-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={busy}
              required
            />
          </div>
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <div className="login-input-wrap">
            <span className="login-input-icon">
              <LockIcon />
            </span>
            <input
              id="password"
              className="input login-input login-input--password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={busy}
              required
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              disabled={busy}
            >
              <EyeIcon hidden={!showPassword} />
            </button>
          </div>
        </div>

        <button className="btn btn-primary login-submit" disabled={busy}>
          {busy ? (
            <>
              <span className="login-spinner" aria-hidden="true" />
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </section>
  );
}
