import { NavLink } from "react-router-dom";

export default function AuthTabs() {
  const itemCls = (isActive) =>
    [
      "flex-1 h-10 rounded-lg text-center leading-10 font-medium transition-all duration-200",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      isActive
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    ].join(" ");

  return (
    <div className="flex gap-1 mb-6 p-1 rounded-lg bg-muted">
      <NavLink end to="/auth/login" className={({isActive}) => itemCls(isActive)}>
        Đăng nhập
      </NavLink>
      <NavLink to="/auth/register" className={({isActive}) => itemCls(isActive)}>
        Đăng ký
      </NavLink>
    </div>
  );
}
