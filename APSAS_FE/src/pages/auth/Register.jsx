// src/pages/auth/Register.jsx
import AuthCard from "../../components/common/AuthCard.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Logo from "../../components/common/Logo.jsx";
import AuthTabs from "../../components/auth/AuthTabs.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../../services/authService.js";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: 1, // 1 - student, 2 - teacher
  });
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChangeRole = (roleValue) => {
    setForm((prev) => ({ ...prev, role: roleValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsError(false);

    if (form.password !== form.confirmPassword) {
      setIsError(true);
      setMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerApi({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role, // lấy role FE chọn
      });

      setMsg(
        res.message ||
          "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực."
      );

      // Chuyển sang màn Verify OTP, kèm email
      navigate(
        `/auth/verify?email=${encodeURIComponent(
          form.email.trim().toLowerCase()
        )}`
      );
    } catch (error) {
      setIsError(true);
      setMsg(error.message || "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthCard>
        <div className="space-y-6">
          <div className="text-center">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Nền tảng học lập trình trực tuyến
            </p>
          </div>

          <AuthTabs />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
              required
            />

            {/* Chọn role khi đăng ký */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Bạn muốn đăng ký làm:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleChangeRole(1)}
                  className={`px-3 py-2 rounded-md text-sm border transition ${
                    form.role === 1
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  1 - Student
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeRole(2)}
                  className={`px-3 py-2 rounded-md text-sm border transition ${
                    form.role === 2
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  2 - Teacher
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting
                  ? `Đang đăng ký (${form.role === 1 ? "Student" : "Teacher"})...`
                  : `Đăng ký (${form.role === 1 ? "Student" : "Teacher"})`}
              </Button>

              {msg && (
                <div
                  className={`text-sm text-center p-3 rounded-md ${
                    isError
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                  }`}
                >
                  {msg}
                </div>
              )}
            </div>
          </form>
        </div>
      </AuthCard>
    </div>
  );
}
