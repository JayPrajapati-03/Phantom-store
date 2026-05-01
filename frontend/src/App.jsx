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
          <img src={product.images?.[0]?.url || "https://placehold.co/600x420/141925/f5f7fb?text=Phantom+Store"} alt={product.name} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover" }} />
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
        <img src={product.images?.[0]?.url || "https://placehold.co/900x700/141925/f5f7fb?text=Phantom+Store"} alt={product.name} style={{ width: "100%", borderRadius: 8 }} />
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
