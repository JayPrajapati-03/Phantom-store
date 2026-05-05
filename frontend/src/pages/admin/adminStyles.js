export const panelStyle = {
  border: "1px solid var(--border-light)",
  borderRadius: 24,
  background: "var(--bg-surface)",
  boxShadow: "var(--shadow-lg)"
};

export const cardStyle = {
  border: "1px solid var(--border-light)",
  borderRadius: 20,
  background: "var(--bg-elevated)"
};

export const inputStyle = {
  width: "100%",
  border: "1px solid var(--border-light)",
  borderRadius: 14,
  background: "var(--bg-surface)",
  color: "var(--text-primary)",
  padding: "13px 14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease"
};

export const labelStyle = {
  display: "grid",
  gap: 8,
  color: "var(--text-secondary)",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.02em"
};

export const buttonStyle = {
  border: "0",
  borderRadius: 14,
  background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
  color: "#fff",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 800,
  boxShadow: "var(--shadow-glow)"
};

export const secondaryStyle = {
  ...buttonStyle,
  background: "var(--bg-elevated)",
  color: "var(--text-primary)",
  boxShadow: "none",
  border: "1px solid var(--border-light)"
};

export const dangerStyle = {
  ...buttonStyle,
  background: "rgba(248, 113, 113, 0.12)",
  color: "var(--error)",
  boxShadow: "none"
};

export const statusColors = {
  pending: { bg: "rgba(251, 191, 36, 0.14)", text: "#facc15" },
  paid: { bg: "rgba(34, 197, 94, 0.14)", text: "#4ade80" },
  processing: { bg: "rgba(59, 130, 246, 0.14)", text: "#60a5fa" },
  shipped: { bg: "rgba(45, 212, 191, 0.14)", text: "#5eead4" },
  delivered: { bg: "rgba(132, 204, 22, 0.14)", text: "#a3e635" },
  cancelled: { bg: "rgba(248, 113, 113, 0.14)", text: "#fca5a5" },
  refunded: { bg: "rgba(244, 114, 182, 0.14)", text: "#f9a8d4" }
};

export const formatStatus = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

export const getStatusStyle = (status) => statusColors[status] || { bg: "rgba(124, 92, 255, 0.14)", text: "#c4b5fd" };

export const categoryOptions = ["glasses", "jackets", "bags", "watches", "shirts", "shoes", "rings", "hats"];
export const arCategoryOptions = ["glasses", "jacket", "bag", "watch", "shirt", "shoes", "ring", "hat"];
