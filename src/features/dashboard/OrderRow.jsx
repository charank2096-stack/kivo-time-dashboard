// OrderRow.jsx — Single row in the orders table

import { useState, useEffect } from "react";

const STATUS_STYLES = {
  Pending:            { bg: "rgba(65,90,119,0.12)",  color: "#415A77" },
  Dispatched:         { bg: "rgba(65,90,119,0.12)",  color: "#415A77" },
  "Out for Delivery":{ bg: "rgba(119,141,169,0.12)", color: "#778DA9" },
  Delivered:          { bg: "rgba(56,102,65,0.12)",  color: "#386641" },
  Returned:           { bg: "rgba(188,71,73,0.12)",  color: "#BC4749" },
};

export default function OrderRow({ order, index, onStatusChange, onAwbChange }) {
  const defaultAwb = order.awb_number || `KIVO-AWB-${order.id.split("-").pop()}`;
  const [awb, setAwb] = useState(defaultAwb);
  const statusStyle = STATUS_STYLES[order.status] || {};

  useEffect(() => {
    setAwb(order.awb_number || `KIVO-AWB-${order.id.split("-").pop()}`);
  }, [order.awb_number, order.id]);

  function handleAwbBlur() {
    const normalized = awb.trim() || "N/A";
    const current = order.awb_number || defaultAwb;
    if (normalized !== current) {
      onAwbChange?.(order.id, normalized);
    }
  }

  return (
    <tr style={{ background: index % 2 === 0 ? "transparent" : "#f9fafb" }}>
      <td style={styles.td}>
        <span style={styles.mono}>{order.order_date}</span>
      </td>
      <td style={styles.td}>
        <span style={styles.name}>{order.customer_name}</span>
      </td>
      <td style={styles.td}>
        <span style={styles.mono}>{order.customer_mobile}</span>
      </td>
      <td style={styles.td}>{order.product_name}</td>
      <td style={styles.td}>
        <span style={styles.value}>₹{order.product_value.toLocaleString("en-IN")}</span>
      </td>
      <td style={styles.td}>
        <span style={styles.mono}>{order.courier_number || "—"}</span>
      </td>
      <td style={styles.td}>
        <span style={styles.mono}>{order.delivery_boy_number || "—"}</span>
      </td>
      <td style={styles.td}>
        <input
          style={styles.input}
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          onBlur={handleAwbBlur}
          placeholder="Enter AWB"
          aria-label="AWB number"
        />
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.badge, background: statusStyle.bg, color: statusStyle.color }}>
          {order.status}
        </span>
      </td>
      <td style={styles.td}>
        <select
          style={styles.select}
          value={order.status}
          onChange={(e) => onStatusChange?.(order.id, e.target.value)}
          aria-label="Update order status"
        >
          {[
            "Pending",
            "Dispatched",
            "Out for Delivery",
            "Delivered",
            "Returned",
          ].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>
    </tr>
  );
}

const styles = {
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #F1F5F9",
    fontSize: "13px",
    color: "#1B263B",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  },
  input: {
    width: "100%",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    padding: "8px 10px",
    fontSize: "13px",
    fontFamily: "'Sora', sans-serif",
    color: "#0D1B2A",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    padding: "8px 10px",
    fontSize: "13px",
    fontFamily: "'Sora', sans-serif",
    color: "#0D1B2A",
    outline: "none",
    background: "#FFFFFF",
    boxSizing: "border-box",
  },
  mono: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    color: "#415A77",
  },
  name: {
    fontWeight: "500",
    color: "#0D1B2A",
  },
  value: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    color: "#0D1B2A",
    fontWeight: "600",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
  },
};
