   import React from "react";
   import ReactDOM from "react-dom/client";
   import App from "./App";
   import { AuthProvider } from "./contexts/AuthContext";
   import { AdminPanel } from "./components/AdminPanel";
   import "./style.css";

   // Initialize React app
   const rootElement = document.getElementById("root");
   if (!rootElement) {
     throw new Error("Root element not found");
   }
   const root = ReactDOM.createRoot(rootElement);

   root.render(
     <React.StrictMode>
       <AuthProvider>
         <App />
       </AuthProvider>
     </React.StrictMode>
   );

   // Initialize AdminPanel globally (asumsikan ini adalah class yang dapat di-instantiate)
   new AdminPanel();

   // Export functions for global access
   export { initializeInsights } from "./hooks/useDeviceData";

   console.log("BAMS Application initialized successfully");
   