// AdminPanel.jsx — Full admin control for Kivo Time

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import { INVESTMENT_PLANS } from "../../services/mockData.js";
import Calculator from "../investment/Calculator.jsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const TABS = ["All Orders", "Partners", "Investment Plans"];

const STATUS_COLORS = {
  Pending:           "#415A77",
  Dispatched:        "#415A77",
  "Out for Delivery":"#778DA9",
  Delivered:         "#386641",
  Returned:          "#BC4749",
};

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("All Orders");
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [partnerFilter, setPartnerFilter] = useState("All");

  // New partner form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPartner, setNewPartner] = useState({ username: "", password: "", franchise_name: "", phone: "", email: "", aadhaar: "", bank_name: "", account_number: "", ifsc: "" });
  const [addMsg, setAddMsg] = useState("");

  // Investment plan form state
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", min_amount: "", max_amount: "", description: "" });
  const [planMsg, setPlanMsg] = useState("");

  // Responsiveness
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    api.getAllOrders().then((d) => { setOrders(d); setOrdersLoading(false); });
    api.getAllPartners().then(setPartners);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      if (q && !o.customer_name.toLowerCase().includes(q) && !o.customer_mobile.includes(q) && !o.id.toLowerCase().includes(q)) return false;
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (partnerFilter !== "All" && o.partnerId !== partnerFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter, partnerFilter]);

  async function togglePartner(id) {
    const updated = await api.togglePartnerStatus(id);
    setPartners((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  }

  async function handleAddPartner() {
    if (!newPartner.username || !newPartner.password || !newPartner.franchise_name) {
      setAddMsg("Fill in username, password, and franchise name.");
      return;
    }
    await api.addPartner(newPartner);
    setAddMsg("Partner added successfully.");
    setNewPartner({ username: "", password: "", franchise_name: "", phone: "", email: "", aadhaar: "", bank_name: "", account_number: "", ifsc: "" });
    const updated = await api.getAllPartners();
    setPartners(updated);
  }

  async function handleStatusChange(orderId, status) {
    const updated = await api.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
  }

  function exportOrdersPDF() {
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
    pdf.text("Kivo Time — All Orders Report (Admin)", margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleDateString("en-IN")} | Total Orders: ${filteredOrders.length}`, margin, yPos);
    yPos += 10;

    // Table
    const tableData = filteredOrders.map((o) => {
      const partnerName = partners.find(p => p.id === o.partnerId)?.franchise_name || "—";
      return [
        o.id,
        o.order_date,
        o.customer_name,
        o.customer_mobile,
        o.product_name,
        `₹${o.product_value.toLocaleString("en-IN")}`,
        partnerName,
        o.status,
      ];
    });

    pdf.setFontSize(9);
    pdf.autoTable({
      head: [["Order ID", "Date", "Customer", "Mobile", "Product", "Value", "Partner", "Status"]],
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
        5: { halign: "right" },
      },
    });

    // Footer
    const finalY = pdf.lastAutoTable.finalY || yPos;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Generated by Kivo Time Admin | Page 1 of 1`,
      margin,
      pageHeight - 10
    );

    pdf.save(`kivo-all-orders-${new Date().toISOString().split("T")[0]}.pdf`);
  }

  async function handleAddPlan() {
    if (!newPlan.name || !newPlan.min_amount) {
      setPlanMsg("Fill in plan name and minimum amount.");
      return;
    }
    await api.updatePlan(`plan_${Date.now()}`, {
      id: `plan_${Date.now()}`,
      name: newPlan.name,
      min_amount: parseInt(newPlan.min_amount),
      max_amount: newPlan.max_amount ? parseInt(newPlan.max_amount) : null,
      description: newPlan.description,
    });
    setPlanMsg("Investment plan added successfully.");
    setNewPlan({ name: "", min_amount: "", max_amount: "", description: "" });
    setTimeout(() => setPlanMsg(""), 3000);
  }

  return (
    <div style={{ ...styles.page, flexDirection: isMobile ? "column" : "row" }}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: isMobile ? "100%" : "240px", height: isMobile ? "auto" : "100vh", position: isMobile ? "relative" : "sticky" }}>
        <div style={{ ...styles.sidebarTop, marginBottom: isMobile ? "20px" : "36px" }}>
          <div style={styles.logo}>KT</div>
          <span style={styles.logoText}>Admin</span>
        </div>

        <nav style={styles.nav}>
          {TABS.map((t) => (
            <button
              key={t}
              style={{ ...styles.navBtn, ...(tab === t ? styles.navBtnActive : {}) }}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <p style={styles.adminName}>{user.franchise_name}</p>
          <p style={styles.adminRole}>Admin</p>
          <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px" : "36px 40px" }}>

        {/* ---- ALL ORDERS ---- */}
        {tab === "All Orders" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={styles.pageTitle}>All Orders</h1>
                <p style={styles.sub}>Across all franchise partners</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={styles.addBtn} onClick={exportOrdersPDF}>Export PDF</button>
              </div>
            </div>

            {/* Filters */}
            <div style={styles.filterBar}>
              <input
                style={styles.searchInput}
                placeholder="Search by name, mobile, or order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {["All", "Pending", "Dispatched", "Out for Delivery", "Delivered", "Returned"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select style={styles.select} value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)}>
                <option value="All">All partners</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.franchise_name}</option>
                ))}
              </select>
            </div>

            {ordersLoading ? <p style={styles.loadTxt}>Loading orders...</p> : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Order ID","Date","Customer","Mobile","Product","Value","Partner","Status","Update Status"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o, i) => (
                      <tr key={o.id} style={{ background: i % 2 === 0 ? "transparent" : "#f9fafb" }}>
                        <td style={styles.td}><span style={styles.mono}>{o.id}</span></td>
                        <td style={styles.td}><span style={styles.mono}>{o.order_date}</span></td>
                        <td style={{ ...styles.td, color: "#111827", fontWeight: 500 }}>{o.customer_name}</td>
                        <td style={styles.td}><span style={styles.mono}>{o.customer_mobile}</span></td>
                        <td style={styles.td}>{o.product_name}</td>
                        <td style={styles.td}><span style={{ ...styles.mono, color: "#0D1B2A", fontWeight: 600 }}>₹{o.product_value.toLocaleString("en-IN")}</span></td>
                        <td style={styles.td}>{partners.find(p => p.id === o.partnerId)?.franchise_name || "—"}</td>
                        <td style={styles.td}>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: STATUS_COLORS[o.status] + "22", color: STATUS_COLORS[o.status] }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <select
                            style={{ ...styles.select, padding: "4px 8px", fontSize: "12px" }}
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          >
                            {["Pending","Dispatched","Out for Delivery","Delivered","Returned"].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={8} style={{ ...styles.th, textAlign: "center", padding: "32px", color: "#4b5563" }}>No orders match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ---- PARTNERS ---- */}
        {tab === "Partners" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={styles.pageTitle}>Partner Accounts</h1>
                <p style={styles.sub}>{partners.length} registered partners</p>
              </div>
              <button style={styles.addBtn} onClick={() => setShowAddForm((p) => !p)}>
                {showAddForm ? "Cancel" : "+ Add partner"}
              </button>
            </div>

            {showAddForm && (
              <div style={styles.addForm}>
                <h3 style={{ color: "#111827", margin: "0 0 16px", fontSize: "15px" }}>New partner details</h3>
                {[
                  { key: "username", label: "Username", placeholder: "e.g. deepak.indiranagar" },
                  { key: "password", label: "Password", placeholder: "Set a strong password" },
                  { key: "franchise_name", label: "Franchise name", placeholder: "e.g. Deepak Watches — Indiranagar" },
                  { key: "phone", label: "Phone", placeholder: "10-digit mobile" },
                  { key: "email", label: "Email", placeholder: "partner@gmail.com" },
                  { key: "aadhaar", label: "Aadhaar Number", placeholder: "XXXX-XXXX-XXXX" },
                  { key: "bank_name", label: "Bank Name", placeholder: "e.g. State Bank of India" },
                  { key: "account_number", label: "Account Number", placeholder: "Bank account #" },
                  { key: "ifsc", label: "IFSC Code", placeholder: "SBIN0XXXXXX" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ marginBottom: "12px" }}>
                    <label style={styles.formLabel}>{label}</label>
                    <input
                      style={styles.formInput}
                      placeholder={placeholder}
                      value={newPartner[key]}
                      onChange={(e) => setNewPartner((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                {addMsg && <p style={{ color: "#34d399", fontSize: "13px", marginBottom: "10px" }}>{addMsg}</p>}
                <button style={styles.addBtn} onClick={handleAddPartner}>Create account</button>
              </div>
            )}

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Franchise","Username","Phone","Email","Joined","Status","Action"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p, i) => (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? "transparent" : "#f9fafb" }}>
                      <td style={{ ...styles.td, color: "#111827", fontWeight: 500 }}>{p.franchise_name}</td>
                      <td style={styles.td}><span style={styles.mono}>{p.username}</span></td>
                      <td style={styles.td}><span style={styles.mono}>{p.phone}</span></td>
                      <td style={styles.td}>{p.email}</td>
                      <td style={styles.td}><span style={styles.mono}>{p.joined}</span></td>
                      <td style={styles.td}>
                        <span style={{ color: p.is_active ? "#34d399" : "#f87171", fontSize: "12px", fontWeight: 600 }}>
                          {p.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{ ...styles.toggleBtn, color: p.is_active ? "#f87171" : "#34d399", borderColor: p.is_active ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)" }}
                          onClick={() => togglePartner(p.id)}
                        >
                          {p.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ---- INVESTMENT PLANS ---- */}
        {tab === "Investment Plans" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={styles.pageTitle}>Investment Plans</h1>
                <p style={styles.sub}>Manage investment offerings. Rate: 11% / month, 18-month term.</p>
              </div>
              <button style={styles.addBtn} onClick={() => setShowPlanForm((p) => !p)}>
                {showPlanForm ? "Cancel" : "+ Add plan"}
              </button>
            </div>

            {showPlanForm && (
              <div style={styles.addForm}>
                <h3 style={{ color: "#111827", margin: "0 0 16px", fontSize: "15px" }}>New investment plan</h3>
                {[
                  { key: "name", label: "Plan name", placeholder: "e.g. Starter Plan" },
                  { key: "min_amount", label: "Minimum amount (₹)", placeholder: "e.g. 100000" },
                  { key: "max_amount", label: "Maximum amount (₹)", placeholder: "e.g. 500000 (optional)" },
                  { key: "description", label: "Description", placeholder: "Plan benefits or details" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ marginBottom: "12px" }}>
                    <label style={styles.formLabel}>{label}</label>
                    <input
                      style={styles.formInput}
                      placeholder={placeholder}
                      value={newPlan[key]}
                      onChange={(e) => setNewPlan((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                {planMsg && <p style={{ color: "#34d399", fontSize: "13px", marginBottom: "10px" }}>{planMsg}</p>}
                <button style={styles.addBtn} onClick={handleAddPlan}>Add plan</button>
              </div>
            )}

            <div style={styles.plansGrid}>
              {INVESTMENT_PLANS.map((plan) => (
                <div key={plan.id} style={styles.planCard}>
                  <h3 style={{ color: "#111827", margin: "0 0 6px", fontSize: "16px" }}>{plan.name}</h3>
                  <p style={{ color: "#0D1B2A", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", margin: "0 0 8px" }}>
                    ₹{plan.min_amount.toLocaleString("en-IN")}
                    {plan.max_amount ? ` – ₹${plan.max_amount.toLocaleString("en-IN")}` : " and above"}
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 10px", lineHeight: "1.5" }}>{plan.description}</p>
                  <div style={{ fontSize: "12px", color: "#9ca3af", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>Monthly return rate: <strong style={{ color: "#0D1B2A" }}>11%</strong></span>
                    <span>Tenure: <strong style={{ color: "#0D1B2A" }}>18 months</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "32px" }}>
              <h2 style={{ ...styles.pageTitle, fontSize: "18px", marginBottom: "4px" }}>Return calculator</h2>
              <p style={styles.sub}>Test any investment amount against the current plan terms.</p>
              <Calculator />
            </div>
          </>
        )}

      </main>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", background: "#ffffff", fontFamily: "'Sora', sans-serif", color: "#1B263B" },
  sidebar: { width: "240px", flexShrink: 0, background: "#0D1B2A", borderRight: "none", display: "flex", flexDirection: "column", padding: "24px 16px", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box" },
  sidebarTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px" },
  logo: { width: "34px", height: "34px", background: "#C5A059", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#0D1B2A" },
  logoText: { fontWeight: "700", fontSize: "16px", color: "#FFFFFF", letterSpacing: "0.5px" },
  nav: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  navBtn: { background: "transparent", border: "none", borderRadius: "8px", padding: "12px 14px", textAlign: "left", color: "#94A3B8", fontSize: "13px", fontFamily: "'Sora', sans-serif", cursor: "pointer", fontWeight: "500", transition: "all 0.2s" },
  navBtnActive: { background: "rgba(197,160,89,0.15)", color: "#FFFFFF" },
  sidebarBottom: { borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" },
  adminName: { fontSize: "12px", color: "#FFFFFF", fontWeight: "600", margin: "0 0 2px" },
  adminRole: { fontSize: "11px", color: "#94A3B8", margin: "0 0 10px" },
  logoutBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "8px 12px", color: "#F1F5F9", fontSize: "12px", fontFamily: "'Sora', sans-serif", cursor: "pointer", width: "100%", textAlign: "left" },
  main: { flex: 1, padding: "36px 40px", overflowX: "auto" },
  pageTitle: { fontSize: "28px", fontWeight: "700", color: "#0D1B2A", margin: "0 0 6px", letterSpacing: "-0.5px" },
  sub: { fontSize: "14px", color: "#415A77", margin: "0 0 32px" },
  filterBar: { display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" },
  searchInput: { flex: "1 1 200px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "9px 14px", color: "#1B263B", fontSize: "13px", fontFamily: "'Sora', sans-serif", outline: "none" },
  select: { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "9px 12px", color: "#1B263B", fontSize: "13px", fontFamily: "'Sora', sans-serif", outline: "none", cursor: "pointer" },
  tableWrap: { overflowX: "auto", borderRadius: "12px", border: "1px solid #E2E8F0" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "800px" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#415A77", textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "2px solid #E2E8F0", background: "#F8FAFC", whiteSpace: "nowrap" },
  td: { padding: "12px 16px", borderBottom: "1px solid #F1F5F9", fontSize: "13px", color: "#1B263B", whiteSpace: "nowrap", verticalAlign: "middle" },
  mono: { fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#415A77" },
  loadTxt: { color: "#415A77", fontSize: "14px", padding: "32px 0" },
  addBtn: { background: "#0D1B2A", border: "none", borderRadius: "8px", padding: "10px 20px", color: "#FFFFFF", fontSize: "13px", fontFamily: "'Sora', sans-serif", cursor: "pointer", fontWeight: "600" },
  addForm: { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "24px", maxWidth: "480px", marginBottom: "24px" },
  formLabel: { display: "block", fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px", fontFamily: "'Sora', sans-serif", fontWeight: "600" },
  formInput: { width: "100%", background: "#ffffff", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "10px 14px", color: "#0D1B2A", fontSize: "13px", fontFamily: "'Sora', sans-serif", outline: "none", boxSizing: "border-box" },
  toggleBtn: { background: "transparent", border: "1px solid", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontFamily: "'Sora', sans-serif", cursor: "pointer", fontWeight: "600" },
  plansGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "4px" },
  planCard: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" },
};
