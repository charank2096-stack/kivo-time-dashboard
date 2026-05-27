// Calculator.jsx — Return calculator for investment plans

import { useState } from "react";

export default function Calculator() {
  const [amount, setAmount] = useState("");
  const RATE = 0.11;
  const MONTHS = 18;

  const principal = parseFloat(amount.replace(/,/g, "")) || 0;
  const monthlyPayout = principal * RATE;
  const totalReturn = monthlyPayout * MONTHS;
  const totalReceived = principal + totalReturn;

  function fmt(n) {
    return n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  return (
    <div style={styles.card}>
      <div style={styles.inputRow}>
        <label style={styles.label}>Investment amount (₹)</label>
        <div style={styles.inputWrap}>
          <span style={styles.rupee}>₹</span>
          <input
            style={styles.input}
            type="number"
            min="0"
            placeholder="e.g. 200000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      {principal > 0 && (
        <div style={styles.results}>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Monthly payout</span>
            <span style={styles.resultValue}>₹{fmt(monthlyPayout)}</span>
          </div>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Total return over 18 months</span>
            <span style={styles.resultValue}>₹{fmt(totalReturn)}</span>
          </div>
          <div style={{ ...styles.resultRow, borderTop: "1px solid rgba(201,168,76,0.2)", paddingTop: "12px", marginTop: "4px" }}>
            <span style={styles.resultLabel}>Total received (principal + return)</span>
            <span style={{ ...styles.resultValue, fontSize: "20px", color: "#0D1B2A" }}>₹{fmt(totalReceived)}</span>
          </div>
        </div>
      )}

      <p style={styles.disclaimer}>
        Returns are calculated at 11% per month on the invested principal over 18 months.
        This is a projection based on current plan terms.
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "480px",
    marginTop: "16px",
  },
  inputRow: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    color: "#415A77",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: "8px",
    fontFamily: "'Sora', sans-serif",
    fontWeight: "600",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  rupee: {
    position: "absolute",
    left: "14px",
    color: "#415A77",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "16px",
  },
  input: {
    width: "100%",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    padding: "12px 14px 12px 32px",
    color: "#0D1B2A",
    fontSize: "16px",
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
    boxSizing: "border-box",
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
    padding: "16px",
    background: "#F8FAFC",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
  },
  resultRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  resultLabel: {
    fontSize: "13px",
    color: "#415A77",
    fontFamily: "'Sora', sans-serif",
  },
  resultValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "16px",
    color: "#0D1B2A",
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: "11px",
    color: "#4b5563",
    lineHeight: "1.6",
    margin: 0,
  },
};
