import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  FileText,
  User,
  Users,
  GraduationCap,
  LayoutDashboard,
  Settings,
  LogOut,
  MessageCircle,
  Folder,
  FolderOpen,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { NAV_BY_ROLE } from "../../constants/navConfig.js";
import { useUI } from "../../store/uiStore.js";

// Icon mapping
const ICON_MAP = {
  "🏠": Home,
  "📚": BookOpen,
  "🧩": FileText,
  "👤": User,
  "👥": Users,
  "🎓": GraduationCap,
  "📊": LayoutDashboard,
  "⚙️": Settings,
  "🚪": LogOut,
  "💬": MessageCircle,
  "📁": Folder,
  "📂": FolderOpen,
  "✅": CheckCircle,
  "🔐": Lock,
};

const itemBase = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "#c9d2e0",
  fontSize: 14,
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useUI?.() ?? { sidebarOpen: true }; // fallback nếu chưa có store

  // Debug log để kiểm tra user và role
  console.log("🔍 Sidebar - User:", user);
  console.log("🔍 Sidebar - Role:", user?.role);

  const items = NAV_BY_ROLE[user?.role] ?? [
    { to: "/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/courses", label: "Khóa học", icon: "📚" },
    { to: "/assignments", label: "Bài tập" },
    { to: "/profile", label: "Trang cá nhân", icon: "👤" },
  ];

  // Custom function to check if a nav item should be active
  const isNavItemActive = (navPath) => {
    const currentPath = location.pathname;

    // Exact match
    if (currentPath === navPath) return true;

    // Special case for provider routes
    if (navPath === "/provider/resource-management") {
      // Match management routes (NO /view/ in path):
      // - /provider/resources/:resourceId (exact)
      // - /provider/resources/:resourceId/create-content
      // - /provider/resources/:resourceId/content/:contentId (without /view/)
      // - /provider/resources/:resourceId/content/:contentId/edit
      // - /provider/resources/:resourceId/assignment/:assignmentId (without /view/)
      // - /provider/resources/:resourceId/assignment/:assignmentId/edit

      if (currentPath === "/provider/resources") return false; // List page
      if (currentPath.includes("/view/") || currentPath.includes("/view"))
        return false; // All view routes

      // Match /provider/resources/:resourceId and all its children (without /view)
      const hasResourceId = /^\/provider\/resources\/[^/]+/.test(currentPath);
      return hasResourceId;
    }

    if (navPath === "/provider/resources") {
      // Match read-only browsing routes (WITH /view or exact list):
      // - /provider/resources (exact - list page)
      // - /provider/resources/:resourceId/view
      // - /provider/resources/:resourceId/view/content/:contentId
      // - /provider/resources/:resourceId/view/assignment/:assignmentId

      if (currentPath === "/provider/resources") return true;
      if (currentPath.includes("/view/") || currentPath.includes("/view"))
        return true;
      return false;
    }

    // For other nav items, use startsWith
    if (currentPath.startsWith(navPath)) {
      return true;
    }

    return false;
  };

  const getIconComponent = (iconEmoji) => {
    const IconComponent = ICON_MAP[iconEmoji] || Home;
    return IconComponent;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      aria-label="Sidebar"
      style={{
        width: 240,
        background: "#0f1419",
        padding: 12,
        borderRight: "1px solid #202934",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        // nếu muốn ẩn/hiện theo toggle
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 200ms ease",
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((it) => {
          const IconComponent = getIconComponent(it.icon);
          const isActive = isNavItemActive(it.to);
          return (
            <NavLink
              key={it.to}
              to={it.to}
              style={{
                ...itemBase,
                background: isActive ? "#18212b" : "transparent",
                color: isActive ? "#ffffff" : "#c9d2e0",
                border: "1px solid",
                borderColor: isActive ? "#2a3441" : "transparent",
              }}
            >
              <span
                style={{
                  width: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconComponent size={18} />
              </span>
              <span>{it.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Spacer to push logout button to bottom */}
      <div style={{ flex: 1 }}></div>

      {/* Logout Button */}
      <div style={{ paddingTop: 12, borderTop: "1px solid #202934" }}>
        <button
          onClick={handleLogout}
          style={{
            ...itemBase,
            width: "100%",
            background: "transparent",
            border: "1px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#18212b";
            e.currentTarget.style.borderColor = "#2a3441";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.color = "#c9d2e0";
          }}
        >
          <span
            style={{
              width: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogOut size={18} />
          </span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
