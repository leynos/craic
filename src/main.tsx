// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") ?? document.createElement("div")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);