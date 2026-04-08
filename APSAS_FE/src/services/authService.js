// src/services/authService.js
import api from "./api.js";

/**
 * LOGIN
 * Gọi POST /auth/login
 * BE trả về: ApiResponse<LoginResponse>
 */
export async function login({ email, password }) {
  try {
    const res = await api.post("/auth/login", { email, password });
    const apiRes = res.data; // { code, message, data }
    const data = apiRes.data || {}; // LoginResponse

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user, // AuthUserDto
      message: apiRes.message,
      code: apiRes.code,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu.";
    throw new Error(message);
  }
}

/**
 * REGISTER
 * Gọi POST /auth/register
 * RegisterRequest: { email, password, name, role, avatar? }
 *  - role: 1 = student, 2 = teacher/lecturer
 */
export async function register({ name, email, password, role = 1, avatar }) {
  try {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
      avatar,
    });

    const apiRes = res.data; // ApiResponse<RegisterResponse>

    return {
      data: apiRes.data,
      message:
        apiRes.message ||
        "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.",
      code: apiRes.code,
    };
  } catch (error) {
    console.error("🔴 Register error:", error);
    const message =
      error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
    throw new Error(message);
  }
}

/**
 * VERIFY OTP
 * Gọi POST /auth/verify
 * VerifyRequest: { email, code }
 */
export async function verifyOtp({ email, code }) {
  try {
    const res = await api.post("/auth/verify", { email, code });
    const apiRes = res.data; // ApiResponse<Void>
    return {
      success: true,
      message: apiRes.message || "Xác thực email thành công.",
    };
  } catch (error) {
    console.error("🔴 Verify OTP error:", error);
    const message =
      error.response?.data?.message ||
      "Mã xác thực không hợp lệ hoặc đã hết hạn.";
    throw new Error(message);
  }
}

/**
 * RESEND CODE
 * Gọi POST /auth/resend-code
 * ResendCodeRequest: { email }
 */
export async function resendVerificationEmail(email) {
  try {
    const res = await api.post("/auth/resend-code", { email });
    const apiRes = res.data; // ApiResponse<Void>
    return {
      success: true,
      message: apiRes.message || "Đã gửi lại mã xác thực tới email của bạn.",
    };
  } catch (error) {
    console.error("🔴 Resend code error:", error);
    const message =
      error.response?.data?.message ||
      "Không thể gửi lại mã xác thực. Vui lòng thử lại.";
    throw new Error(message);
  }
}

/**
 * REFRESH TOKEN
 * Gọi POST /auth/refresh-token
 * RefreshTokenRequest: { refreshToken, userId }
 * Response: { code: "OK", message: "...", data: { accessToken, refreshToken, user } }
 */
export async function refreshToken(refreshTokenValue, userId) {
  try {
    // Nếu không truyền userId, lấy từ localStorage
    if (!userId) {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      userId = user?.id;
    }

    const res = await api.post("/auth/refresh-token", {
      refreshToken: refreshTokenValue,
      userId: userId
    });

    const apiRes = res.data; // ApiResponse<RefreshTokenResponse>
    console.log("🔄 Refresh token response:", apiRes);

    if (apiRes.code === "OK") {
      const { accessToken, refreshToken: newRefreshToken, user } = apiRes.data;

      // Lưu vào localStorage
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        console.log("✅ Access token updated in localStorage");
      }
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
        console.log("✅ Refresh token updated in localStorage");
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        console.log("✅ User info updated in localStorage");
      }

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user,
        success: true,
        message: apiRes.message || "Token đã được làm mới thành công"
      };
    }

    return {
      success: false,
      message: apiRes.message || "Không thể làm mới token"
    };
  } catch (error) {
    console.error("🔴 Refresh token error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Phiên đăng nhập đã hết hạn"
    };
  }
}

/**
 * INTROSPECT TOKEN
 * Gọi POST /auth/introspect
 * IntrospectRequest: { token }
 * Trả về: { valid: boolean }
 */
export async function fetchMe(token) {
  if (!token) return { valid: false };

  try {
    console.log(
      "🔍 Calling introspect with token:",
      token.substring(0, 20) + "..."
    );
    const res = await api.post("/auth/introspect", { token });
    console.log("✅ Introspect full response:", res.data);

    const apiRes = res.data; // ApiResponse<IntrospecResponse>

    // Backend trả về: { code: "OK", message: "...", data: { valid: true } }
    if (apiRes.code === "OK" || apiRes.code === "0") {
      return apiRes.data || { valid: false };
    }

    console.warn("⚠️ Unexpected code:", apiRes.code);
    return { valid: false };
  } catch (error) {
    console.error("🔴 Introspect error:", error);
    console.error("Response:", error.response?.data);
    console.error("Status:", error.response?.status);
    return { valid: false };
  }
}

// (tuỳ chọn) export default object, nếu muốn import kiểu khác
export default {
  login,
  register,
  verifyOtp,
  resendVerificationEmail,
  refreshToken,
  fetchMe,
};
