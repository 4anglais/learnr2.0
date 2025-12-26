import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Load GA dynamically
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const loadGtag = () => {
  if (!GA_MEASUREMENT_ID) return;

  // Load GA script
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize GA
  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  `;
  document.head.appendChild(script2);
};

loadGtag();

// Render React app
createRoot(document.getElementById("root")!).render(<App />);
