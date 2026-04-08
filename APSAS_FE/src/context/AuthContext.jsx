import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import * as authService from "../services/authService.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";
const AVATAR_KEY = "user_avatar";

// Chuẩn hóa role từ backend (ADMIN, STUDENT, CONTENT_PROVIDER, LECTURER) -> FE (admin, student, provider, lecturer)
// Backend role names: ADMIN, STUDENT, LECTURER, CONTENT_PROVIDER, GUEST
// Frontend role names: admin, student, lecturer, provider, guest
function normalizeRoleName(roleStr) {
  if (!roleStr) return undefined;
  const normalized = String(roleStr).toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("student")) return "student";
  if (normalized.includes("lecturer")) return "lecturer";
  if (normalized.includes("provider") || normalized.includes("content_provider")) return "provider"; // CONTENT_PROVIDER -> provider
  if (normalized.includes("teacher")) return "teacher";
  return normalized;
}

// Tạo user object từ JWT accessToken
function buildUserFromToken(token) {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    const scope = decoded.scope || "";
    const scopeParts = String(scope).split(" ").filter(Boolean);
    const roleFromScope = scopeParts.find((s) => s.startsWith("ROLE_"));
    const normalizedRole = roleFromScope
      ? normalizeRoleName(roleFromScope.replace("ROLE_", ""))
      : undefined;

    return {
      id: decoded.sub ? Number(decoded.sub) : undefined,
      name: decoded.name,
      email: decoded.email,
      role: normalizedRole,
      roles: normalizedRole ? [normalizedRole] : [],
      avatar: null,
    };
  } catch (e) {
    console.error("Không decode được JWT:", e);
    return null;
  }
}

// Chuẩn hóa user nhận từ API LoginResponse.user (AuthUserDto)
function normalizeUserFromApi(userFromApi, token) {
  if (!userFromApi && token) {
    return buildUserFromToken(token);
  }
  if (!userFromApi) return null;

  const rawRoles = Array.isArray(userFromApi.roles) ? userFromApi.roles : [];
  const normalizedRoles = rawRoles.map(normalizeRoleName).filter(Boolean);
  const primaryRole = normalizedRoles[0];

  return {
    id: userFromApi.id,
    name: userFromApi.name,
    email: userFromApi.email,
    avatar: userFromApi.avatar,
    roles: normalizedRoles,
    role: primaryRole,
  };
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const isAuthenticated = !!token && !!user;

  const logout = () => {
    setToken(null);
    setUser(null);
    setHasInitialized(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    // Keep avatar cached across logout/login so user custom avatar persists on this device.
    // Remove the full user object but keep separate avatar cache.
    localStorage.removeItem(USER_KEY);
  };

  // Khởi tạo / kiểm tra lại token mỗi khi token thay đổi
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        console.log(
          "🔄 AuthContext init - token:",
          token?.substring(0, 20) + "..."
        );
        console.log("🔄 AuthContext init - user:", user);

        // Không có token -> clear user
        if (!token) {
          console.log("❌ No token found");
          setUser(null);
          setIsLoading(false);
          setHasInitialized(true);
          return;
        }

        // Nếu chưa có user, thì thử lấy từ localStorage hoặc decode JWT
        let currentUser = user;
        if (!currentUser) {
          console.log("👤 Building user from token...");
          const localUserRaw = localStorage.getItem(USER_KEY);
          if (localUserRaw) {
            try {
              const parsed = JSON.parse(localUserRaw);
              currentUser = parsed;
              setUser(parsed);
              console.log("✅ User loaded from localStorage:", parsed);
            } catch {
              const decodedUser = buildUserFromToken(token);
              currentUser = decodedUser;
              setUser(decodedUser);
              if (decodedUser) {
                localStorage.setItem(USER_KEY, JSON.stringify(decodedUser));
              }
              console.log("✅ User decoded from token:", decodedUser);
            }
          } else {
            const decodedUser = buildUserFromToken(token);
            currentUser = decodedUser;
            setUser(decodedUser);
            if (decodedUser) {
              localStorage.setItem(USER_KEY, JSON.stringify(decodedUser));
            }
            console.log("✅ User decoded from token:", decodedUser);
          }
        }

        // ✨ OPTIMIZATION: Không gọi introspect ở đây nữa!
        // 🔄 API interceptor trong api.js sẽ tự động:
        //    - Detect lỗi 401 
        //    - Thử refresh token
        //    - Logout nếu refresh fail
        // 🚀 Kết quả: Ít API calls, performance tốt hơn
        console.log("✅ Auth initialized - API interceptor will handle validation");
      } catch (err) {
        if (!cancelled) {
          console.error("🔴 Lỗi init auth:", err);
          // Chỉ log error, không logout ở đây
          // Để API interceptor handle authentication errors
        }
      } finally {
        if (!cancelled) {
          console.log("✅ AuthContext init completed, isLoading = false");
          setIsLoading(false);
          setHasInitialized(true);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, hasInitialized]);

  // Hàm login: gọi service + cập nhật context + localStorage
  const login = async ({ email, password }) => {
    const res = await authService.login({ email, password });
    const normalizedUser = normalizeUserFromApi(res.user, res.accessToken);

    // If backend login response does not include avatar, try to preserve a locally cached avatar
    let finalUser = normalizedUser ? { ...normalizedUser } : {};
    try {
      const cachedAvatar = localStorage.getItem(AVATAR_KEY);
      if ((!finalUser.avatar || finalUser.avatar === null) && cachedAvatar) {
        finalUser.avatar = cachedAvatar;
      }
    } catch (e) {
      console.warn("Failed to read cached avatar:", e);
    }

    setToken(res.accessToken);
    setUser(finalUser);

    localStorage.setItem(TOKEN_KEY, res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem(REFRESH_KEY, res.refreshToken);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(finalUser));

    return normalizedUser;
  };

  // (tuỳ chọn) bung hàm register từ context, nếu muốn gọi qua context
  const register = async (payload) => {
    return authService.register(payload);
  };

  // Validate token khi thực sự cần thiết (manual call)
  const validateToken = async () => {
    if (!token) return false;
    
    try {
      const result = await authService.fetchMe(token);
      if (!result?.valid) {
        logout();
        return false;
      }
      return true;
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return false;
      }
      // Network/server errors không logout
      return true;
    }
  };

  // Update tokens and user after refresh
  const updateTokens = (newAccessToken, newRefreshToken, newUser) => {
    console.log("🔄 Updating tokens in AuthContext...");
    
    if (newAccessToken) {
      setToken(newAccessToken);
      localStorage.setItem(TOKEN_KEY, newAccessToken);
    }
    
    if (newRefreshToken) {
      localStorage.setItem(REFRESH_KEY, newRefreshToken);
    }
    
    if (newUser) {
      let normalizedUser = normalizeUserFromApi(newUser, newAccessToken);
      // Merge cached avatar if backend didn't return one
      try {
        const cachedAvatar = localStorage.getItem(AVATAR_KEY);
        if (cachedAvatar && (!normalizedUser.avatar || normalizedUser.avatar === null)) {
          normalizedUser = { ...(normalizedUser || {}), avatar: cachedAvatar };
        }
      } catch {
        /* ignore */
      }
      setUser(normalizedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      console.log("✅ User updated in AuthContext:", normalizedUser);
    }
  };

  // Listen for token refresh events from API interceptor
  useEffect(() => {
    const handleTokenRefresh = (event) => {
      const { accessToken, refreshToken, user } = event.detail;
      console.log("🔄 Token refreshed event received in AuthContext");
      updateTokens(accessToken, refreshToken, user);
    };

    window.addEventListener('token-refreshed', handleTokenRefresh);
    return () => {
      window.removeEventListener('token-refreshed', handleTokenRefresh);
    };
  }, []);

  const value = {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    validateToken, // Manual token validation khi cần
    updateTokens, // Update tokens after refresh
    // Update user in context and persist to localStorage
    updateUser: (patch) => {
      setUser((prev) => {
        const next = Object.assign({}, prev || {}, patch || {});
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(next));
          if (patch && patch.avatar) {
            try {
              localStorage.setItem(AVATAR_KEY, patch.avatar);
            } catch {
              /* ignore */
            }
          }
        } catch (e) {
          console.error("Không thể lưu user vào localStorage:", e);
        }
        return next;
      });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom Hook: `useAuth`
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }

  return context;
};
