import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ⬅️ כאן Tailwind נכנס לאתר
import "./services/firebase";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
