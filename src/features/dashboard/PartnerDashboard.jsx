// PartnerDashboard.jsx — Main view for franchise partners

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import OrderFilters from "./OrderFilters.jsx";
import OrderRow from "./OrderRow.jsx";
import Calculator from "../investment/Calculator.jsx";
import { INVESTMENT_PLANS } from "../../services/mockData.js";
import jsPDF from "jspdf";
import "jspdf-autotable";

const COLUMNS = [
  "Order Date", "Customer Name", "Mobile", "Product Name", "Product Value",
  "Courier #", "Delivery Boy #", "AWB Number", "Status", "Update Status",
];

export default function PartnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [filters, setFilters] = useState({ search: "", dateFrom: "", dateTo: "", status: "All" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    api.getMyOrders(user.id).then((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => window.removeEventListener("resize", handleResize);
  }, [user.id]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = filters.search.toLowerCase();
      if (q && !o.customer_name.toLowerCase().includes(q) && !o.customer_mobile.includes(q)) return false;
      if (filters.status !== "All" && o.status !== filters.status) return false;
      if (filters.dateFrom && o.order_date < filters.dateFrom) return false;
      if (filters.dateTo && o.order_date > filters.dateTo) return false;
      return true;
    });
  }, [orders, filters]);

  function getOrderAwb(order) {
    return order.awb_number || `KIVO-AWB-${order.id.split("-").pop()}`;
  }

  async function updateOrderStatus(orderId, status) {
    const updated = await api.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  async function updateOrderAwb(orderId, awb_number) {
    const updated = await api.updateOrderAwb(orderId, awb_number);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  function exportCSV() {
    const header = COLUMNS.join(",");
    const rows = filtered.map((o) =>
      [
        o.order_date, `"${o.customer_name}"`, o.customer_mobile,
        `"${o.product_name}"`, o.product_value,
        o.courier_number || "—", o.delivery_boy_number || "—", getOrderAwb(o), o.status, ""
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kivo-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    let yPos = margin;

    // Header
    pdf.setFontSize(18);
    pdf.text("Kivo Time — Order Report", margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Franchise: ${user.franchise_name}`, margin, yPos);
    yPos += 5;
    pdf.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, margin, yPos);
    yPos += 10;

    // Table
    const tableData = filtered.map((o) => [
      o.order_date,
      o.customer_name,
      o.customer_mobile,
      o.product_name,
      `₹${o.product_value.toLocaleString("en-IN")}`,
      o.courier_number || "—",
      o.delivery_boy_number || "—",
      getOrderAwb(o),
      o.status,
      "",
    ]);

    pdf.setFontSize(9);
    pdf.autoTable({
      head: [COLUMNS],
      body: tableData,
      startY: yPos,
      margin: margin,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: 60,
      },
      headStyles: {
        fillColor: [201, 168, 76],
        textColor: 10,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        4: { halign: "right" },
      },
    });

    // Footer
    const finalY = pdf.lastAutoTable.finalY || yPos;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Total orders: ${filtered.length} | Page 1 of 1`,
      margin,
      pageHeight - 10
    );

    pdf.save(`kivo-orders-${new Date().toISOString().split("T")[0]}.pdf`);
  }

  // Summary stats
  const stats = useMemo(() => ({
    total: orders.length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    pending: orders.filter((o) => o.status === "Pending").length,
    revenue: orders.filter((o) => o.status === "Delivered").reduce((sum, o) => sum + o.product_value, 0),
  }), [orders]);

  return (
    <div style={{ ...styles.page, flexDirection: isMobile ? "column" : "row", overflowX: "hidden" }}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: isMobile ? "100%" : "240px", height: isMobile ? "auto" : "100vh", position: isMobile ? "relative" : "sticky", padding: isMobile ? "16px" : "24px 16px" }}>
        <div style={{ ...styles.sidebarTop, marginBottom: isMobile ? "16px" : "36px" }}>
          <div style={styles.logo}>KT</div>
          <span style={styles.logoText}>Kivo Time</span>
        </div>

        <nav style={styles.nav}>
          {[
            { id: "orders", label: "My Orders" },
            { id: "inventory", label: "Inventory" },
            { id: "investment", label: "Investment" },
            { id: "profile", label: "My Profile" },
          ].map((item) => (
            <button
              key={item.id}
              style={{ ...styles.navBtn, ...(activeTab === item.id ? styles.navBtnActive : {}) }}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user.franchise_name}</p>
            <p style={styles.userRole}>Partner account</p>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px" : "36px 40px", minWidth: 0 }}>
        {activeTab === "orders" && (
          <>
            <div style={{ ...styles.header, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "16px" : "12px" }}>
              <div>
                <h1 style={styles.pageTitle}>Your Orders</h1>
                <p style={styles.pageSubtitle}>{isMobile ? "Orders for " : "All orders assigned to "}{user.franchise_name}</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={styles.exportBtn} onClick={exportCSV}>Export CSV</button>
                <button style={styles.exportBtn} onClick={exportPDF}>Export PDF</button>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ ...styles.statsRow, gridTemplateColumns: isMobile ? "repeat(auto-fit, minmax(130px, 1fr))" : "repeat(auto-fit, minmax(140px, 1fr))" }}>
              {[
                { label: "Total orders", value: stats.total },
                { label: "Delivered", value: stats.delivered },
                { label: "Pending", value: stats.pending },
                { label: "Revenue (delivered)", value: `₹${stats.revenue.toLocaleString("en-IN")}` },
              ].map((s) => (
                <div key={s.label} style={styles.statCard}>
                  <p style={styles.statLabel}>{s.label}</p>
                  <p style={styles.statValue}>{s.value}</p>
                </div>
              ))}
            </div>

            <OrderFilters filters={filters} onChange={setFilters} />

            {loading ? (
              <p style={styles.loadingText}>Fetching your orders...</p>
            ) : (
              <>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {COLUMNS.map((col) => (
                          <th key={col} style={styles.th}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={COLUMNS.length} style={{ ...styles.th, textAlign: "center", padding: "32px", color: "#4b5563" }}>
                            No orders match your current filters.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((order, i) => (
                          <OrderRow
                            key={order.id}
                            order={order}
                            index={i}
                            onStatusChange={updateOrderStatus}
                            onAwbChange={updateOrderAwb}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <p style={styles.count}>
                  Showing {filtered.length} of {orders.length} orders
                </p>
              </>
            )}
          </>
        )}

        {activeTab === "investment" && <InvestmentTab />}
        {activeTab === "inventory" && <InventoryTab />}
        {activeTab === "profile" && <ProfileTab user={user} />}
      </main>
    </div>
  );
}

// --- Investment Tab (embedded for partner view) ---
function InvestmentTab() {
  return (
    <div>
      <h1 style={styles.pageTitle}>Investment Plans</h1>
      <p style={styles.pageSubtitle}>11% monthly payout over an 18-month term</p>

      <div style={styles.plansGrid}>
        {INVESTMENT_PLANS.map((plan) => (
          <div key={plan.id} style={styles.planCard}>
            <h3 style={styles.planName}>{plan.name}</h3>
            <p style={styles.planRange}>
              ₹{plan.min_amount.toLocaleString("en-IN")}
              {plan.max_amount ? ` – ₹${plan.max_amount.toLocaleString("en-IN")}` : " and above"}
            </p>
            <p style={styles.planDesc}>{plan.description}</p>
            <div style={styles.planMeta}>
              <span>Monthly return: <strong style={{ color: "#0D1B2A" }}>11%</strong></span>
              <span>Tenure: <strong style={{ color: "#0D1B2A" }}>18 months</strong></span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "32px" }}>
        <h2 style={{ ...styles.pageTitle, fontSize: "18px" }}>Return calculator</h2>
        <p style={styles.pageSubtitle}>Enter an amount to see what your monthly and total returns would look like.</p>
        <Calculator />
      </div>
    </div>
  );
}

// --- Inventory Tab ---
function InventoryTab() {
  const items = [
    { id: "SKU-001", name: "Titan Raga Viva", stock: 12, price: 4850 },
    { id: "SKU-002", name: "Casio G-Shock", stock: 5, price: 7200 },
    { id: "SKU-003", name: "Fossil Gen 6", stock: 3, price: 15999 },
  ];
  return (
    <div>
      <h1 style={styles.pageTitle}>Inventory Management</h1>
      <p style={styles.pageSubtitle}>Track your available stock across all product lines.</p>
      <div style={{ ...styles.tableWrap, marginTop: "24px" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["SKU ID", "Product Name", "Available Stock", "Unit Price"].map(h => <th key={h} style={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td style={styles.td}>{i.id}</td>
                <td style={styles.td}>{i.name}</td>
                <td style={styles.td}>{i.stock} units</td>
                <td style={styles.td}>₹{i.price.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Profile Tab ---
function ProfileTab({ user }) {
  const sections = [
    {
      title: "Identity & Contact",
      fields: [
        { label: "Client Name", value: user.franchise_name },
        { label: "Your Name", value: user.username },
        { label: "Aadhaar Number", value: user.aadhaar },
        { label: "Email ID", value: user.email },
        { label: "Mobile Number", value: user.phone },
        { label: "WhatsApp Number", value: user.whatsapp },
      ]
    },
    {
      title: "Location Details",
      fields: [
        { label: "State", value: user.state },
        { label: "Full Address", value: user.address },
        { label: "Pincode", value: user.pincode },
        { label: "Allotted Pincode", value: user.allotted_pincode },
        { label: "Coupon Code ID", value: user.coupon_id },
      ]
    },
    {
      title: "Bank Details (Profit Payout)",
      fields: [
        { label: "Payment Method", value: user.payment_method },
        { label: "Bank Name", value: user.bank_name },
        { label: "Account Holder", value: user.account_holder },
        { label: "Account Number", value: user.account_number },
        { label: "IFSC Code", value: user.ifsc },
      ]
    }
  ];

  return (
    <div>
      <h1 style={styles.pageTitle}>Franchise Profile</h1>
      <p style={styles.pageSubtitle}>Official details for {user.franchise_name}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginTop: "24px" }}>
        {sections.map(s => (
          <div key={s.title} style={styles.statCard}>
            <h3 style={{ ...styles.planName, color: "#0D1B2A", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>{s.title}</h3>
            {s.fields.map(f => (
              <div key={f.label} style={{ marginBottom: "12px" }}>
                <p style={styles.statLabel}>{f.label}</p>
                <p style={{ ...styles.statValue, fontSize: "14px" }}>{f.value || "—"}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily: "'Sora', sans-serif",
    color: "#1B263B",
  },
  sidebar: {
    width: "240px",
    flexShrink: 0,
    background: "#0D1B2A",
    borderRight: "none",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    position: "sticky",
    top: 0,
    height: "100vh",
    boxSizing: "border-box",
  },
  sidebarTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "36px",
  },
  logo: {
    width: "34px",
    height: "34px",
    background: "#C5A059",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#0D1B2A",
  },
  logoText: {
    fontWeight: "700",
    fontSize: "16px",
    color: "#FFFFFF",
    letterSpacing: "0.5px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  navBtn: {
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    padding: "10px 12px",
    textAlign: "left",
    color: "#94A3B8",
    fontSize: "13px",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
    transition: "all 0.15s",
    fontWeight: "500",
  },
  navBtnActive: {
    background: "rgba(197,160,89,0.15)",
    color: "#FFFFFF",
  },
  sidebarBottom: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "16px",
  },
  userInfo: {
    marginBottom: "10px",
  },
  userName: {
    fontSize: "12px",
    color: "#FFFFFF",
    fontWeight: "600",
    margin: "0 0 2px",
    lineHeight: "1.3",
  },
  userRole: {
    fontSize: "11px",
    color: "#6b7280",
    margin: 0,
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #e5e7eb",
    borderRadius: "7px",
    padding: "8px 12px",
    color: "#6b7280",
    fontSize: "12px",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  },
  main: {
    flex: 1,
    padding: "36px 40px",
    overflowX: "auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "12px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0D1B2A",
    margin: "0 0 4px",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    fontSize: "13px",
    color: "#415A77",
    margin: 0,
  },
  exportBtn: {
    background: "#0D1B2A",
    border: "none",
    borderRadius: "8px",
    padding: "9px 18px",
    color: "#FFFFFF",
    fontSize: "13px",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
    fontWeight: "600",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "14px",
    marginBottom: "28px",
  },
  statCard: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "16px",
  },
  statLabel: {
    fontSize: "11px",
    color: "#415A77",
    margin: "0 0 6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0D1B2A",
    margin: 0,
    fontFamily: "'JetBrains Mono', monospace",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "600",
    color: "#415A77",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    borderBottom: "2px solid #E2E8F0",
    background: "#F8FAFC",
    whiteSpace: "nowrap",
  },
  loadingText: {
    color: "#415A77",
    fontSize: "14px",
    padding: "32px 0",
  },
  count: {
    fontSize: "12px",
    color: "#4b5563",
    marginTop: "12px",
  },
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "20px",
    marginBottom: "8px",
  },
  planCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
  },
  planName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 4px",
  },
  planRange: {
    fontSize: "13px",
    color: "#0D1B2A",
    fontFamily: "'JetBrains Mono', monospace",
    margin: "0 0 8px",
  },
  planDesc: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "0 0 12px",
    lineHeight: "1.5",
  },
  planMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "12px",
    color: "#9ca3af",
  },
};
