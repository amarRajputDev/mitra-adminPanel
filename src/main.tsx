import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import FcmToken from "./fcntoken.tsx";
import React from "react";

createRoot(document.getElementById("root")!).render(
 <React.StrictMode>
    <App />
    <FcmToken /> {/* this requests token and listens for messages */}
  </React.StrictMode>
);
