import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Global reset
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0f; color: #d1d5db; font-family: 'Sora', sans-serif; }
  input:focus { border-color: rgba(201,168,76,0.5) !important; }
  select option { background: #1a1a2e; color: #d1d5db; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 3px; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
