// src/components/common/MainAppLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Các component UI
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useUI } from "../../store/uiStore";
import Navbar from "./Navbar";

export default function MainAppLayout() {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const { sidebarOpen } = useUI();
  const location = useLocation();
  const isWideLayout = ["/lecturer/assignments", "/student/my-courses"].some((path) =>
    location.pathname.startsWith(path)
  );
  const contentWidthClass = isWideLayout ? "max-w-[1800px]" : "max-w-[1400px]";

  // Debug log để kiểm tra
  console.log("MainAppLayout - Debug:", {
    isAuthenticated,
    isLoading,
    user,
    token: token ? `${token.substring(0, 20)}...` : null,
  });

  if (isLoading) {
    return (
      <div
        style={{
          /* Full page loader */ placeItems: "center",
          display: "grid",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        Đang tải...
      </div>
    );
  }

  if (!isAuthenticated) {
    // === TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP ===
    // Chỉ render Navbar công khai + Trang (Outlet) + Footer
    return (
      <div className="min-h-screen bg-[#0b0f12] flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  // === TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP ===
  // Render layout "Protected" (Header + Sidebar + Trang + Footer)
  return (
    <div className="flex min-h-screen bg-[#0b0f12]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#0f1419] border-r border-[#202934] transition-transform duration-200 z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "240px" }}
      >
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col transition-all duration-200"
        style={{ marginLeft: sidebarOpen ? "240px" : "0" }}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div
            className={`container mx-auto px-4 sm:px-6 lg:px-10 py-6 ${contentWidthClass}`}
          >
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
