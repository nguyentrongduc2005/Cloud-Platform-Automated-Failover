// src/pages/auth/VerifyOtp.jsx
import AuthCard from "../../components/common/AuthCard.jsx";
import Button from "../../components/common/Button.jsx";
import Logo from "../../components/common/Logo.jsx";
import OTPInput from "../../components/auth/OTPInput.jsx";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  verifyOtp,
  resendVerificationEmail,
} from "../../services/authService.js";

export default function VerifyOtp() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsError(false);

    if (!email) {
      setIsError(true);
      setMsg("Thiếu email. Vui lòng quay lại đăng ký và thử lại.");
      return;
    }

    if (!code || code.length < 6) {
      setIsError(true);
      setMsg("Vui lòng nhập đủ 6 số mã xác thực.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp({ email, code });
      setMsg(res.message || "Xác thực email thành công.");
      setIsError(false);

      // Sau khi verify thành công -> chuyển sang login
      navigate("/auth/login", { replace: true });
    } catch (error) {
      setIsError(true);
      setMsg(error.message || "Xác thực thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setIsError(true);
      setMsg("Thiếu email. Vui lòng quay lại đăng ký và thử lại.");
      return;
    }
    setIsResending(true);
    setMsg("");
    setIsError(false);

    try {
      const res = await resendVerificationEmail(email);
      setMsg(res.message || "Đã gửi lại mã xác thực.");
    } catch (error) {
      setIsError(true);
      setMsg(error.message || "Không thể gửi lại mã xác thực.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthCard>
        <div className="space-y-6">
          <div className="text-center">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Nhập mã xác thực đã được gửi tới email
              {email && (
                <span className="font-semibold text-primary"> {email}</span>
              )}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="flex justify-center">
              <OTPInput length={6} onChange={setCode} />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Đang xác thực..." : "Xác thực email"}
              </Button>

              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="w-full text-sm text-primary hover:underline disabled:opacity-60"
              >
                {isResending
                  ? "Đang gửi lại mã..."
                  : "Gửi lại mã xác thực"}
              </button>

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
