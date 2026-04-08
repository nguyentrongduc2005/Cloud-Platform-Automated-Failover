import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchMe } from "../../services/authService.js";

export default function AuthGuard({ allow }) {
  const nav = useNavigate();
  const location = useLocation();
  const { user, token, logout, isLoading: isContextLoading } = useAuth();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isContextLoading) return;

    let cancelled = false;

    (async () => {
      try {
        // Không có token -> đá về login
        if (!token) {
          if (!cancelled) {
            nav("/auth/login", {
              replace: true,
              state: { from: location },
            });
          }
          return;
        }

        // Kiểm tra token còn valid không
        const result = await fetchMe(token);
        if (!cancelled && !result?.valid) {
          logout();
          nav("/auth/login", {
            replace: true,
            state: { from: location },
          });
          return;
        }

        // Nếu có danh sách role allow, check luôn
        if (!cancelled && allow && allow.length > 0 && user) {
          const canAccess =
            allow.some((r) => user.role === r) ||
            allow.some((r) => user.roles?.includes(r));
          if (!canAccess) {
            // Không đủ quyền -> cho về trang chủ
            nav("/", { replace: true });
            return;
          }
        }

        if (!cancelled) setIsChecked(true);
      } catch (err) {
        console.error("AuthGuard error:", err);
        if (!cancelled) {
          logout();
          nav("/auth/login", {
            replace: true,
            state: { from: location },
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isContextLoading, token, user, allow, nav, logout, location]);

  if (isContextLoading || !isChecked) {
    return <div>Đang xác thực...</div>;
  }

  return <Outlet />;
}
