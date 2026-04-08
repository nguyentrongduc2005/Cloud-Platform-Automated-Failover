// src/components/common/AuthLayout.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // muốn thêm cái loading thì thêm vào đây 
    // return <div>Đang tải...</div>;
  }

  // Nếu đã đăng nhập, không cho vào trang Login/Register nữa
  if (isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  // Render form Login/Register
  return (
    <div className="auth-page-container">
      <Outlet />
    </div>
  );
}
