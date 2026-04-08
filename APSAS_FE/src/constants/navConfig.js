export const NAV_BY_ROLE = {
  student: [
    { to: "/courses", label: "Khám phá", icon: "🏠" },
    { to: "/student/my-courses", label: "Khóa học của tôi", icon: "📚" },
    { to: "/student/progress", label: "Tiến độ", icon: "🧩" },
    { to: "/profile", label: "Trang cá nhân", icon: "👤" },
    { to: "/support", label: "Hỗ trợ", icon: "💬" },
  ],
  teacher: [
    { to: "/courses", label: "Khám phá", icon: "🏠" },
    { to: "/lecturer/my-courses", label: "Khóa học của tôi", icon: "📚" },
    { to: "/resources", label: "Tài nguyên", icon: "📁" },
    { to: "/profile", label: "Trang cá nhân", icon: "👤" },
    { to: "/support", label: "Hỗ trợ", icon: "💬" },
  ],
  lecturer: [
    { to: "/courses", label: "Khám phá", icon: "🏠" },
    { to: "/lecturer/my-courses", label: "Khóa học của tôi", icon: "📚" },
    { to: "/resources", label: "Tài nguyên", icon: "📁" },
    { to: "/profile", label: "Trang cá nhân", icon: "👤" },
    { to: "/support", label: "Hỗ trợ", icon: "💬" },
  ],
  provider: [
    { to: "/courses", label: "Khám phá", icon: "🏠" },
    { to: "/provider/resources", label: "Tài nguyên", icon: "📁" },
    {
      to: "/provider/resource-management",
      label: "Quản lý tài nguyên",
      icon: "📂",
    },
    { to: "/profile", label: "Trang cá nhân", icon: "👤" },
    { to: "/support", label: "Hỗ trợ", icon: "💬" },
  ],
  admin: [
    { to: "/courses", label: "Khám phá", icon: "🏠" },
    { to: "/admin/users", label: "Quản lí người dùng", icon: "👥" },
    { to: "/admin/content", label: "Xác nhận nội dung", icon: "✅" },
    { to: "/admin/permissions", label: "Quản lý quyền truy cập", icon: "🔐" },
    { to: "/admin/resources", label: "Tài nguyên", icon: "📁" },
    { to: "/profile", label: "Trang cá nhân", icon: "👤" },
    { to: "/support", label: "Hỗ trợ", icon: "💬" },
  ],
};
