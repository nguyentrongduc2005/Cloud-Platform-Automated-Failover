import React from "react";
import AppRoutes from "./routes";
import { Toaster } from "./components/ui/sonner";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  console.log("📱 App component RENDER");
  const { theme } = useTheme();
  
  return (
    <div className={theme}>
      <AppRoutes />
      <Toaster />
    </div>
  );
}
