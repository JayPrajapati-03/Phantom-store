export const panelStyle = {
  border: "1px solid rgba(101, 123, 168, 0.22)",
  borderRadius: 24,
  background: "linear-gradient(180deg, rgba(16, 21, 31, 0.96), rgba(11, 14, 22, 0.98))",
  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)"
};

export const cardStyle = {
  border: "1px solid rgba(92, 111, 150, 0.2)",
  borderRadius: 20,
  background: "rgba(18, 23, 34, 0.92)"
};

export const inputStyle = {
  width: "100%",
  border: "1px solid #2a3346",
  borderRadius: 14,
  background: "#111722",
  color: "#fff",
  padding: "13px 14px",
  outline: "none",
  boxSizing: "border-box"
};

export const labelStyle = {
  display: "grid",
  gap: 8,
  color: "#dbe5ff",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.02em"
};

export const buttonStyle = {
  border: "0",
  borderRadius: 14,
  background: "linear-gradient(135deg, #8a5cff, #5d8bff)",
  color: "#fff",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 800,
  boxShadow: "0 12px 30px rgba(93, 139, 255, 0.2)"
};

export const secondaryStyle = {
  ...buttonStyle,
  background: "#263044",
  boxShadow: "none"
};

export const dangerStyle = {
  ...buttonStyle,
  background: "#2b1d24",
  color: "#ffb9cb",
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
