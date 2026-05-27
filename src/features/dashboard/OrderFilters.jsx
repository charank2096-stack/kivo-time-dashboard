// OrderFilters.jsx — Search, date, and status filters for order table

export default function OrderFilters({ filters, onChange }) {
  const statuses = ["All", "Pending", "Dispatched", "Out for Delivery", "Delivered", "Returned"];

  return (
    <div style={styles.bar}>
      <input
        style={styles.search}
        type="text"
        placeholder="Search name, mobile or product..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />

      <div style={styles.group}>
        <label style={styles.label}>From</label>
        <input
          style={styles.date}
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>To</label>
        <input
          style={styles.date}
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
        />
      </div>

      <select
        style={styles.select}
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
        ))}
      </select>

      <button
        style={styles.clearBtn}
        onClick={() => onChange({ search: "", dateFrom: "", dateTo: "", status: "All" })}
      >
        Clear
      </button>
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
    marginBottom: "20px",
  },
  search: {
    flex: "1 1 200px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "9px 14px",
    color: "#111827",
    fontSize: "13px",
    fontFamily: "'Sora', sans-serif",
    outline: "none",
    minWidth: "180px",
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  label: {
    fontSize: "10px",
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    fontWeight: "600",
  },
  date: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "8px 10px",
    color: "#111827",
    fontSize: "13px",
    fontFamily: "'Sora', sans-serif",
    outline: "none",
    colorScheme: "light",
  },
  select: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "9px 12px",
    color: "#111827",
    fontSize: "13px",
    fontFamily: "'Sora', sans-serif",
    outline: "none",
    cursor: "pointer",
  },
  clearBtn: {
    background: "transparent",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "9px 14px",
    color: "#6b7280",
    fontSize: "13px",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },
};
