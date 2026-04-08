import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 bg-black/70 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 h-full flex items-center justify-between text-white">
        <Link to="/" className="flex items-center gap-2">
          {/* Khuyên dùng file logo trong /public: /logo-apsas.svg hoặc /logo.png */}
          <img src={logo} alt="APSAS" className="h-7 w-auto" />
          <span className="font-extrabold text-xl tracking-wide">
            CodeVerse
          </span>
        </Link>

        <nav className="flex items-center gap-8 text-sm">
          <Link to="/courses" className="hover:text-emerald-400">
            Course
          </Link>
          <Link to="/contact" className="hover:text-emerald-400">
            Contact us
          </Link>
          <Link to="/auth/login" className="hover:text-emerald-400">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
