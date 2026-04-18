// src/services/api.js
import axios from "axios";

// ==============================
// DYNAMIC BASE URL HELPER (Clean Code)
// ==============================
const getBaseUrl = () => {
  const runtimeBase = window.__ENV__?.VITE_API_BASE?.trim();
  const buildBase = import.meta.env.VITE_API_BASE?.trim();

  if (runtimeBase) return runtimeBase;
  if (buildBase) return buildBase;

  // Default to same-origin API through nginx/ingress to avoid CORS and mixed-content issues.
  return "/api";
};

// ==============================
// BASE CONFIG
// ==============================
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // không dùng cookie
});

// ==============================
// REQUEST INTERCEPTOR
// ==============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `%c[API REQUEST] ${config.method.toUpperCase()} → ${config.url}`,
      "color:#4ade80;",
      config
    );

    return config;
  },
  (error) => {
    console.error("🔴 REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

// ==============================
// REFRESH TOKEN LOGIC
// ==============================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/**
 * CALL REFRESH TOKEN API
 */
async function refreshTokenService() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.error("🔴 No refresh token found in localStorage");
    return null;
  }

  // Lấy userId từ localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;

  if (!userId) {
    console.error("🔴 No userId found in localStorage");
    return null;
  }

  console.log("🔄 RefreshTokenService called with:", {
    refreshToken: refreshToken.substring(0, 20) + "...",
    userId: userId,
    baseURL: getBaseUrl() // <-- Đã sửa để log đúng URL thực tế
  });

  try {
    // Sử dụng axios trực tiếp nhưng với URL linh hoạt từ getBaseUrl()
    const res = await axios.post(
      `${getBaseUrl()}/auth/refresh-token`,
      {
        refreshToken,
        userId
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000 // 10s timeout
      }
    );

    // Backend response format: { code: "OK", message: "...", data: { accessToken, refreshToken, user } }
    const apiRes = res.data;
    console.log("🔄 RefreshTokenService response:", {
      code: apiRes.code,
      message: apiRes.message,
      hasData: !!apiRes.data,
      hasAccessToken: !!apiRes.data?.accessToken,
      hasRefreshToken: !!apiRes.data?.refreshToken,
      hasUser: !!apiRes.data?.user
    });

    if (apiRes.code === "OK" && apiRes.data) {
      const { accessToken, refreshToken: newRefreshToken, user } = apiRes.data;

      // Cập nhật localStorage ngay lập tức
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        console.log("✅ New access token saved to localStorage");
      }
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
        console.log("✅ New refresh token saved to localStorage");
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        console.log("✅ User info updated in localStorage");
      }

      return apiRes.data; // { accessToken, refreshToken, user }
    }

    console.warn("⚠️ Unexpected response format:", apiRes);
    return null;
  } catch (err) {
    console.error("🔴 Refresh token service error:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });
    return null;
  }
}

// ==============================
// RESPONSE INTERCEPTOR
// ==============================
api.interceptors.response.use(
  (response) => {
    console.log(
      `%c[API RESPONSE] ${response.config.url}`,
      "color:#60a5fa;",
      response
    );
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    console.log("🔍 Response interceptor triggered:", {
      status: error.response?.status,
      url: originalRequest?.url,
      isRetry: originalRequest?._retry,
      isRefreshing
    });

    // Nếu lỗi 401 & chưa retry → thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔄 Attempting token refresh...");

      if (isRefreshing) {
        console.log("⏳ Already refreshing, adding to queue...");
        // Chờ token được refresh xong
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log("✅ Queue resolved with new token");
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            console.log("❌ Queue rejected:", err);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("📞 Calling refreshTokenService...");
        const tokenData = await refreshTokenService();

        if (!tokenData) {
          console.log("❌ Refresh token failed - logging out");
          // Refresh token hết hạn → logout
          processQueue(error, null);
          isRefreshing = false;

          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
          return Promise.reject(error);
        }

        const { accessToken, refreshToken: newRefreshToken, user } = tokenData;
        console.log("✅ Token refreshed successfully:", {
          newTokenLength: accessToken?.length,
          userId: user?.id
        });

        // Tokens đã được lưu trong refreshTokenService, chỉ cần update api headers
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        // Dispatch custom event để AuthContext có thể update (optional)
        if (user) {
          window.dispatchEvent(new CustomEvent('token-refreshed', {
            detail: { accessToken, refreshToken: newRefreshToken, user }
          }));
        }

        isRefreshing = false;

        // Gửi lại request ban đầu
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        console.log("🔄 Retrying original request with new token...");
        return api(originalRequest);

      } catch (refreshError) {
        console.error("🔴 Refresh token service threw error:", refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }
    }

    // Không phải 401 hoặc đã retry rồi
    console.log("🔴 RESPONSE ERROR (not handling):", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      payload: error.config?.data
    });

    return Promise.reject(error);
  }
);

export default api;