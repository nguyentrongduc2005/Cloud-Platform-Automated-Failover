// src/components/common/ProtectedLayout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; // 👈 Đổi sang AuthContext
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import Footer from "./Footer.jsx";
import { useUI } from "../../store/uiStore.js";

export default function ProtectedLayout({ allow }) {
  const nav = useNavigate();
  const { sidebarOpen } = useUI(); // Lấy 'closeSidebar' nếu bạn cần

  // 1. Lấy state từ AuthContext
  // isLoading: là trạng thái "đang kiểm tra token trong localStorage"
  // logout: là hàm để xóa auth state (thay cho clearFn)
  const { token, logout, isLoading: isContextLoading } = useAuth();

  // 'ready': là trạng thái "đã xác thực token với server"
  const [ready, setReady] = useState(false);

  // 2. Xác thực + điều hướng
  useEffect(() => {
    // Không làm gì cả cho đến khi Context load xong
    if (isContextLoading) {
      return;
    }

    // Nếu Context nói KHÔNG có token -> về login
    if (!token) {
      nav("/auth/login", { replace: true });
      return;
    }

    // ✅ KHÔNG xác thực token với server nữa!
    // 🔄 API interceptor sẽ tự động handle 401 và refresh token
    // Nếu có token -> cho phép render luôn
    console.log("✅ ProtectedLayout: Token exists, trusting API interceptor");
    setReady(true);
  }, [isContextLoading, token, allow, nav, logout]); // 👈 Dependencies đã cập nhật

  // 3) Loader
  // Chờ cả Context load VÀ server xác thực xong
  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "#eaf0f6",
          background: "#0b0f12",
        }}
      >
        Đang tải…
      </div>
    );
  }

  // 4) Khung UI chung + trang con (Giữ nguyên)
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: sidebarOpen ? "240px 1fr" : "0 1fr",
        minHeight: "100vh",
        background: "#0b0f12",
        transition: "grid-template-columns 200ms ease",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          borderRight: sidebarOpen ? "1px solid #202934" : "none",
        }}
      >
        <div
          style={{
            width: 240,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 200ms ease",
          }}
        >
          <Sidebar />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateRows: "56px 1fr auto" }}>
        <Header />
        <main style={{ padding: 20, color: "#eaf0f6" }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
