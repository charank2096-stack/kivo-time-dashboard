// Login.jsx — Login screen for Kivo Time

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { login, loginError, setLoginError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError("Enter your username and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch {
      // error already set in context
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandArea}>
          <div style={styles.logo}>KT</div>
          <h1 style={styles.brand}>Kivo Time</h1>
          <p style={styles.tagline}>Franchise Partner Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setLoginError(""); }}
              placeholder="e.g. rajan.bengaluru"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...styles.input, paddingRight: "44px" }}
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                placeholder="Your password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {loginError && (
            <div style={styles.error}>{loginError}</div>
          )}

          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={styles.footer}>
          No account yet? Contact your Kivo Time manager to get set up.
        </p>

        <div style={styles.demoCreds}>
          <p style={styles.demoTitle}>Demo credentials</p>
          <code style={styles.code}>admin / Admin@2024</code>
          <code style={styles.code}>rajan.bengaluru / Partner@123</code>
          <code style={styles.code}>priya.koramangala / Partner@456</code>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0f 0%, #12121e 50%, #0a0e1a 100%)",
    background: "#E0E1DD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Sora', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(201,168,76,0.2)",
    background: "#FFFFFF",
    border: "1px solid #778DA9",
    borderRadius: "16px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
    boxShadow: "0 24px 64px rgba(13, 27, 42, 0.1)",
  },
  brandArea: {
    textAlign: "center",
    marginBottom: "36px",
  },
  logo: {
    width: "56px",
    height: "56px",
    background: "linear-gradient(135deg, #c9a84c, #e8c96d)",
    background: "#C5A059",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontSize: "20px",
    fontWeight: "700",
    color: "#0a0a0f",
    color: "#0D1B2A",
    letterSpacing: "1px",
  },
  brand: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#f0e6c8",
    color: "#0D1B2A",
    margin: "0 0 4px",
    letterSpacing: "-0.5px",
  },
  tagline: {
    fontSize: "13px",
    color: "#6b7280",
    color: "#415A77",
    margin: 0,
    letterSpacing: "0.5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#9ca3af",
    color: "#1B263B",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#FFFFFF",
    border: "1px solid #778DA9",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "#f0e6c8",
    color: "#0D1B2A",
    fontSize: "14px",
    fontFamily: "'Sora', sans-serif",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
  },
  error: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    background: "rgba(188, 71, 73, 0.1)",
    border: "1px solid rgba(188, 71, 73, 0.3)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#f87171",
    color: "#BC4749",
    fontSize: "13px",
    lineHeight: "1.4",
  },
  btn: {
    background: "linear-gradient(135deg, #c9a84c, #e8c96d)",
    color: "#0a0a0f",
    background: "#0D1B2A",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "13px",
    fontFamily: "'Sora', sans-serif",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.3px",
    transition: "opacity 0.2s",
    marginTop: "6px",
  },
  footer: {
    fontSize: "12px",
    color: "#4b5563",
    color: "#415A77",
    textAlign: "center",
    marginTop: "24px",
    marginBottom: "0",
  },
  demoCreds: {
    marginTop: "24px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  demoTitle: {
    fontSize: "11px",
    color: "#4b5563",
    color: "#415A77",
    margin: "0 0 6px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  code: {
    fontSize: "11px",
    color: "#415A77",
    fontFamily: "'JetBrains Mono', monospace",
    background: "none",
    padding: "1px 0",
    display: "block",
  },
};
