import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, Moon, Sun } from "lucide-react";
import logo from "@/assets/logo.png";
import { useUI } from "../../store/uiStore.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import NotificationDropdown from "./NotificationDropdown";

export default function Header() {
  const navigate = useNavigate();
  const { toggleSidebar, sidebarOpen } = useUI();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 bg-[#0f1419] border-b border-[#202934] sticky top-0 z-20">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Menu + Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Menu"
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-[#202934] bg-[#0b0f12] text-white hover:bg-[#131a22] transition"
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="APSAS" className="h-7 w-auto" />
            <span className="font-extrabold text-xl text-white hidden sm:block">
              CodeVerse
            </span>
          </Link>
        </div>

        {/* Center: Search (hidden on mobile) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="search"
              placeholder="Tìm kiếm..."
              className="w-full h-9 pl-10 pr-4 bg-[#0b0f12] border border-[#202934] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Right: Actions + User */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationDropdown />
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg border border-[#202934] bg-[#0b0f12] text-white hover:bg-[#131a22] transition items-center justify-center hidden sm:flex relative overflow-hidden group"
            title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
          >
            <Sun 
              size={18} 
              className={`absolute transition-all duration-300 ${
                theme === "dark" 
                  ? "rotate-0 opacity-100 scale-100" 
                  : "rotate-90 opacity-0 scale-0"
              }`}
            />
            <Moon 
              size={18} 
              className={`absolute transition-all duration-300 ${
                theme === "light" 
                  ? "rotate-0 opacity-100 scale-100" 
                  : "rotate-90 opacity-0 scale-0"
              }`}
            />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#202934] hover:bg-[#0b0f12] transition rounded-lg pr-2 cursor-pointer"
            title="Xem hồ sơ"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "Avatar"}
                className="h-9 w-9 rounded-full object-cover"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="hidden lg:block">
              <div className="text-sm font-medium text-white leading-tight">
                {user?.name || "Người dùng"}
              </div>
              <div className="text-xs text-gray-400 leading-tight">
                {user?.role === "admin" && "Quản trị viên"}
                {user?.role === "lecturer" && "Giảng viên"}
                {user?.role === "student" && "Sinh viên"}
                {user?.role === "provider" && "Nhà cung cấp"}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
