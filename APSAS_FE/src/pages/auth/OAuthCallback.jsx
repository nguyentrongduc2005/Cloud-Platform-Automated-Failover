import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/common/Logo";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { updateTokens, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Đang xử lý đăng nhập...");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // 1. Lấy token và thông tin user từ URL params
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const userId = searchParams.get("userId");
        const userName = searchParams.get("userName");
        const userEmail = searchParams.get("userEmail");
        const userRoles = searchParams.get("userRoles");
        const userAvatar = searchParams.get("userAvatar");

        if (!accessToken || !refreshToken) {
          throw new Error("Không tìm thấy thông tin đăng nhập");
        }

        // 2. Tạo userData từ thông tin trả về và JWT
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        
        const userData = {
          id: userId ? parseInt(userId) : tokenPayload.sub,
          email: userEmail || tokenPayload.email,
          name: decodeURIComponent(userName || tokenPayload.name || ""),
          avatar: userAvatar ? decodeURIComponent(userAvatar) : null,
          role: userRoles?.includes("STUDENT") ? "student" 
                : userRoles?.includes("LECTURER") ? "lecturer"
                : userRoles?.includes("ADMIN") ? "admin"
                : tokenPayload.scope?.includes("ROLE_STUDENT") ? "student" 
                : tokenPayload.scope?.includes("ROLE_LECTURER") ? "lecturer"
                : tokenPayload.scope?.includes("ROLE_ADMIN") ? "admin"
                : "student", // mặc định là student
          roles: userRoles ? [userRoles.toLowerCase()] : ["student"],
          permissions: tokenPayload.scope ? tokenPayload.scope.split(' ').filter(scope => !scope.startsWith('ROLE_')) : []
        };

        // 3. Lưu vào localStorage và cập nhật AuthContext
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // 4. Cập nhật AuthContext using updateTokens method
        updateTokens(accessToken, refreshToken, userData);

        setStatus("success");
        setMessage("Đăng nhập thành công! Đang chuyển hướng...");

        // 5. Chuyển hướng sau 1.5s
        setTimeout(() => {
          const targetPath = userData.role === "admin" 
            ? "/admin/users"
            : userData.role === "lecturer"
            ? "/lecturer/my-courses" 
            : "/student/my-courses";

          navigate(targetPath, { replace: true });
        }, 1500);

      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setMessage(error.message || "Có lỗi xảy ra trong quá trình đăng nhập");
        
        // Chuyển về trang login sau 3s nếu có lỗi
        setTimeout(() => {
          navigate("/auth/login", { replace: true });
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, updateTokens]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-[#0f1419] border border-[#202934] rounded-2xl p-8 w-full max-w-md text-center space-y-6">
        <Logo />
        
        <div className="space-y-4">
          {status === "processing" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-gray-300">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-400 font-medium">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-400">{message}</p>
              <p className="text-xs text-gray-400">
                Tự động chuyển về trang đăng nhập sau 3 giây...
              </p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          APSAS Learning Platform
        </div>
      </div>
    </div>
  );
}