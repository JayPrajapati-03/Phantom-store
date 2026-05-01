import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ARCanvas from "./ar/ARCanvas.jsx";
import api from "./utils/api.js";
import { useAuthStore } from "./store/authStore.js";
import { useCartStore } from "./store/cartStore.js";
import { useProductSearch } from "./ai/useProductSearch.js";
import { useStyleSuggestion } from "./ai/useStyleSuggestion.js";

const shellStyle = {
  minHeight: "100vh",
  background: "#0b0d12",
  color: "#f5f7fb",
  fontFamily: "Inter, ui-sans-serif, system-ui, Arial, sans-serif"
};

const categoryArtwork = {
  glasses: { bg: "#1c2536", accent: "#7aa2ff", shape: "M95 140c0-17 13-30 30-30h48c12 0 23 7 28 18l8 17h16l8-17c5-11 16-18 28-18h48c17 0 30 13 30 30v22c0 17-13 30-30 30h-48c-13 0-24-8-29-20l-6-13h-34l-6 13c-5 12-16 20-29 20h-48c-17 0-30-13-30-30v-22z" },
  jacket: { bg: "#33243a", accent: "#f2b45a", shape: "M120 70l40-25 40 25 26 64-28 18-14-34v102h-48v-52h-12v52H76V118L62 152l-28-18 26-64 40-25z" },
  jackets: { bg: "#33243a", accent: "#f2b45a", shape: "M120 70l40-25 40 25 26 64-28 18-14-34v102h-48v-52h-12v52H76V118L62 152l-28-18 26-64 40-25z" },
  shirt: { bg: "#243448", accent: "#8bd3c7", shape: "M120 72l38-26 30 20-18 30v124H70V96L52 66l30-20 38 26z" },
  shirts: { bg: "#243448", accent: "#8bd3c7", shape: "M120 72l38-26 30 20-18 30v124H70V96L52 66l30-20 38 26z" },
  shoes: { bg: "#1a2130", accent: "#f97373", shape: "M52 154c22 0 36-8 48-26l18-26 16 12c11 8 24 12 38 12h36c12 0 22 10 22 22v22H52c-12 0-22-10-22-22v-8c0-12 10-22 22-22z" },
  watch: { bg: "#2f2632", accent: "#f6c177", shape: "M140 54h20l10 34h-40l10-34zm-18 50h56c13 0 24 11 24 24v28c0 13-11 24-24 24h-56c-13 0-24-11-24-24v-28c0-13 11-24 24-24zm18 92h20l10 34h-40l10-34z" },
  watches: { bg: "#2f2632", accent: "#f6c177", shape: "M140 54h20l10 34h-40l10-34zm-18 50h56c13 0 24 11 24 24v28c0 13-11 24-24 24h-56c-13 0-24-11-24-24v-28c0-13 11-24 24-24zm18 92h20l10 34h-40l10-34z" },
  bag: { bg: "#3c2f28", accent: "#d4a373", shape: "M80 102h120l12 96H68l12-96zm34 0V90c0-20 12-34 26-34s26 14 26 34v12h-20V92c0-9-3-16-6-16s-6 7-6 16v10h-20z" },
  bags: { bg: "#3c2f28", accent: "#d4a373", shape: "M80 102h120l12 96H68l12-96zm34 0V90c0-20 12-34 26-34s26 14 26 34v12h-20V92c0-9-3-16-6-16s-6 7-6 16v10h-20z" },
  ring: { bg: "#4a2f2a", accent: "#ffd166", shape: "M120 126c0-28 22-50 50-50s50 22 50 50-22 50-50 50-50-22-50-50zm24 0c0 14 12 26 26 26s26-12 26-26-12-26-26-26-26 12-26 26z" },
  rings: { bg: "#4a2f2a", accent: "#ffd166", shape: "M120 126c0-28 22-50 50-50s50 22 50 50-22 50-50 50-50-22-50-50zm24 0c0 14 12 26 26 26s26-12 26-26-12-26-26-26-26 12-26 26z" },
  hat: { bg: "#334255", accent: "#a3be8c", shape: "M72 148c0-8 6-14 14-14h108c8 0 14 6 14 14s-6 14-14 14H86c-8 0-14-6-14-14zm34-18c0-22 16-42 40-42s40 20 40 42h-80z" },
  hats: { bg: "#334255", accent: "#a3be8c", shape: "M72 148c0-8 6-14 14-14h108c8 0 14 6 14 14s-6 14-14 14H86c-8 0-14-6-14-14zm34-18c0-22 16-42 40-42s40 20 40 42h-80z" }
};

const makeArtworkDataUrl = (product) => {
  const key = String(product?.arCategory || product?.category || "").toLowerCase();
  const artwork = categoryArtwork[key] || { bg: "#202838", accent: "#7c5cff", shape: "M86 84h108v88H86z" };
  const label = String(product?.name || "Phantom Store").slice(0, 28);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 210">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${artwork.bg}"/>
          <stop offset="100%" stop-color="#10141d"/>
        </linearGradient>
      </defs>
      <rect width="280" height="210" rx="18" fill="url(#bg)"/>
      <circle cx="228" cy="44" r="26" fill="${artwork.accent}" fill-opacity="0.18"/>
      <path d="${artwork.shape}" fill="${artwork.accent}"/>
      <text x="24" y="182" fill="#f5f7fb" font-family="Arial, sans-serif" font-size="20" font-weight="700">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getProductImageSrc = (product) => {
  const src = product?.images?.[0]?.url;
  if (!src || src.includes("placehold.co")) {
    return makeArtworkDataUrl(product);
  }

  return src;
};

function Layout({ children }) {
  const { user, logout, isAdmin } = useAuthStore();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <div style={shellStyle}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottom: "1px solid #222834" }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 22 }}>Phantom Store</Link>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link to="/cart" style={{ color: "#d8e1ff" }}>Cart ({cartCount})</Link>
          {isAdmin() && <Link to="/admin" style={{ color: "#d8e1ff" }}>Admin</Link>}
          {user ? (
            <button onClick={logout} style={buttonStyle}>Logout</button>
          ) : (
            <Link to="/login" style={{ color: "#d8e1ff" }}>Login</Link>
          )}
        </nav>
      </header>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: 24 }}>{children}</main>
    </div>
  );
}

const buttonStyle = {
  border: "0",
  borderRadius: 6,
  background: "#7c5cff",
  color: "#fff",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700
};

function Home() {
  const [query, setQuery] = useState("");
  const { products, loading, search } = useProductSearch();

  useEffect(() => {
    search("");
  }, [search]);

  const submit = (event) => {
    event.preventDefault();
    search(query);
  };

  return (
    <Layout>
      <section style={{ display: "grid", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 44, margin: "10px 0" }}>Browser-native AR try-on commerce</h1>
          <p style={{ color: "#abb7ce", maxWidth: 700 }}>Shop products with 3D previews, AI style support, and camera-based try-on experiences.</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", gap: 10 }}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search glasses, jackets, watches..." style={inputStyle} />
          <button style={buttonStyle}>Search</button>
        </form>
        {loading ? <p>Loading products...</p> : <ProductGrid products={products} />}
      </section>
    </Layout>
  );
}

function ProductGrid({ products }) {
  if (!products.length) return <p style={{ color: "#abb7ce" }}>No products found.</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
      {products.map((product) => (
        <article key={product._id} style={{ background: "#141925", border: "1px solid #252d3d", borderRadius: 8, overflow: "hidden" }}>
          <img src={getProductImageSrc(product)} alt={product.name} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }} />
          <div style={{ padding: 14 }}>
            <h3 style={{ margin: "0 0 8px" }}>{product.name}</h3>
            <p style={{ margin: "0 0 12px", color: "#abb7ce" }}>${Number(product.price).toFixed(2)}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <Link to={`/products/${product._id}`} style={buttonLinkStyle}>View</Link>
              <Link to={`/try-on/${product._id}`} style={secondaryLinkStyle}>Try On</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

const buttonLinkStyle = {
  ...buttonStyle,
  textDecoration: "none",
  display: "inline-block"
};

const secondaryLinkStyle = {
  ...buttonLinkStyle,
  background: "#263044"
};

const inputStyle = {
  width: "100%",
  border: "1px solid #2a3346",
  borderRadius: 6,
  background: "#111722",
  color: "#fff",
  padding: "12px 14px"
};

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  if (!product) return <Layout><p>Loading product...</p></Layout>;

  return (
    <Layout>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 420px)", gap: 24 }}>
        <img src={getProductImageSrc(product)} alt={product.name} style={{ width: "100%", borderRadius: 8, aspectRatio: "4 / 3", objectFit: "cover", display: "block" }} />
        <section>
          <h1>{product.name}</h1>
          <p style={{ color: "#abb7ce" }}>{product.description}</p>
          <p style={{ fontSize: 26, fontWeight: 800 }}>${Number(product.price).toFixed(2)}</p>
          <p>Stock: {product.stock}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={buttonStyle} onClick={() => { addItem(product); toast.success("Added to cart"); }}>Add to cart</button>
            <Link to={`/try-on/${product._id}`} style={secondaryLinkStyle}>Try in AR</Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function TryOn() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [captureReviewImage, setCaptureReviewImage] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const { suggestions, reason, loading, getSuggestions } = useStyleSuggestion();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  useEffect(() => {
    if (!product?._id) return;

    getSuggestions(product._id, product.category).catch(() => {});
  }, [getSuggestions, product]);

  const getAiReview = async () => {
    if (!product || !captureReviewImage) return;

    try {
      setReviewLoading(true);
      const imageBase64 = captureReviewImage();
      const response = await api.post("/ai/review", {
        imageBase64,
        productName: product.name
      });
      setReview(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to review outfit");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <Layout>
      <h1>AR Try On</h1>
      <div style={{ height: 640, border: "1px solid #263044", borderRadius: 8, overflow: "hidden", background: "#05070b" }}>
        {product ? <ARCanvas product={product} onCaptureReady={setCaptureReviewImage} /> : <p style={{ padding: 20 }}>Loading AR asset...</p>}
      </div>
      {product && (
        <section style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p style={{ color: "#abb7ce", margin: 0 }}>Capture your current AR look and get AI styling feedback.</p>
          <button style={buttonStyle} onClick={getAiReview} disabled={reviewLoading || !captureReviewImage}>
            {reviewLoading ? "Reviewing..." : "Get AI review"}
          </button>
        </section>
      )}
      {review && (
        <section style={{ marginTop: 18, background: "#141925", border: "1px solid #252d3d", borderRadius: 8, padding: 16, display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0 }}>AI outfit review</h2>
          <p style={{ margin: 0, color: "#f5f7fb" }}>Score: {review.score}/10</p>
          {!!review.tips?.length && (
            <div style={{ color: "#abb7ce", display: "grid", gap: 6 }}>
              {review.tips.map((tip, index) => (
                <p key={`${index}-${tip}`} style={{ margin: 0 }}>{index + 1}. {tip}</p>
              ))}
            </div>
          )}
        </section>
      )}
      {product && (
        <section style={{ marginTop: 24, display: "grid", gap: 14 }}>
          <div>
            <h2 style={{ marginBottom: 8 }}>Style suggestions</h2>
            <p style={{ color: "#abb7ce", margin: 0 }}>
              {loading ? "Finding matching pieces..." : reason || "Suggested items that pair well with this look."}
            </p>
          </div>
          <ProductGrid products={suggestions} />
        </section>
      )}
    </Layout>
  );
}

function Cart() {
  const { items, removeItem, updateQty, total } = useCartStore();

  return (
    <Layout>
      <h1>Cart</h1>
      {items.map((item) => (
        <div key={item._id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px", gap: 12, padding: 12, borderBottom: "1px solid #222834" }}>
          <span>{item.name}</span>
          <input type="number" min="1" value={item.quantity} onChange={(event) => updateQty(item._id, Number(event.target.value))} style={inputStyle} />
          <button style={secondaryLinkStyle} onClick={() => removeItem(item._id)}>Remove</button>
        </div>
      ))}
      <h2>Total: ${total().toFixed(2)}</h2>
      <Link to="/checkout" style={buttonLinkStyle}>Checkout</Link>
    </Layout>
  );
}

function Checkout() {
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
    <Layout>
      <h1>Checkout</h1>
      <p>Total due: ${total().toFixed(2)}</p>
      <button style={buttonStyle} disabled={!items.length} onClick={checkout}>Create payment intent</button>
    </Layout>
  );
}

function Confirmed() {
  return (
    <Layout>
      <h1>Order confirmed</h1>
      <p style={{ color: "#abb7ce" }}>Your Phantom Store order is being processed.</p>
      <Link to="/" style={buttonLinkStyle}>Continue shopping</Link>
    </Layout>
  );
}

function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    const res = await api.post("/auth/login", form);
    login(res.data.user, res.data.token);
    navigate("/");
  };

  return (
    <Layout>
      <form onSubmit={submit} style={{ maxWidth: 420, display: "grid", gap: 12 }}>
        <h1>Login</h1>
        <input style={inputStyle} type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <input style={inputStyle} type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        <button style={buttonStyle}>Login</button>
      </form>
    </Layout>
  );
}

function Admin() {
  const { isAdmin } = useAuthStore();
  const [stats, setStats] = useState({ products: 0 });

  useEffect(() => {
    api.get("/products?limit=1").then((res) => setStats({ products: res.data.pagination.total }));
  }, []);

  if (!isAdmin()) return <Navigate to="/" replace />;

  return (
    <Layout>
      <h1>Admin</h1>
      <p>Products in catalog: {stats.products}</p>
    </Layout>
  );
}

export default function App() {
  const routes = useMemo(
    () => (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/try-on/:id" element={<TryOn />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmed" element={<Confirmed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    ),
    []
  );

  return routes;
}
