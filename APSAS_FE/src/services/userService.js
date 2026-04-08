import api from "./api";

/**
 * User Service - Xử lý các API liên quan đến user profile
 */

// Map giới tính BE ↔ FE
const genderMapApiToUi = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

const genderMapUiToApi = {
  Nam: "MALE",
  Nữ: "FEMALE",
  Khác: "OTHER",
};

/**
 * Lấy thông tin profile của user hiện tại
 * BE: GET /api/me  (trả về ApiResponse<ProfileResponse>)
 * @returns {Promise} User profile data đã map cho FE
 */
export const getUserProfile = async (authToken) => {
  try {
    // Prefer token passed in, otherwise read from localStorage (AuthContext keeps it there)
    const token = authToken || localStorage.getItem("token");

    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }

    const response = await api.get("/me", config); // context-path /api + /me
    const data = response.data?.data || {};

    // Map từ ProfileResponse (BE) → formData (FE)
    return {
      id: data.id ?? null,
      name: data.name || "",
      email: data.email || "",
      avatar: data.avatar || "",
      bio: data.bio || "",
      phone: data.phone || "",
      address: data.address || "",
      // BE: dob (LocalDate) → FE: dateOfBirth (string, dùng cho input type="date")
      dateOfBirth: data.dob || "",
      // MALE/FEMALE/OTHER → Nam/Nữ/Khác
      gender: data.gender ? genderMapApiToUi[data.gender] || "" : "",
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin profile của user
 * BE: POST /api/me  (body: UpdateProfileRequest)
 * @param {Object} profileData - Dữ liệu profile cần cập nhật (đang lấy từ formData của Profile.jsx)
 * @returns {Promise} Updated user data (đã map cho FE)
 */
export const updateUserProfile = async (profileData) => {
  try {
    // Map từ FE → UpdateProfileRequest (BE)
    const payload = {
      name: profileData.name,
      gender: profileData.gender
        ? genderMapUiToApi[profileData.gender] || null
        : null,
      dob: profileData.dateOfBirth || null, // input type="date" sẽ trả yyyy-MM-dd
      address: profileData.address || null,
      phone: profileData.phone || null,
      bio: profileData.bio || null,
      // email hiện BE không cho chỉnh trong UpdateProfileRequest, nên không gửi cũng được
    };

    const response = await api.post("/me", payload);
    const data = response.data?.data || {};

    // Map lại để trả cho Profile.jsx dùng
    const mapped = {
      id: data.id ?? null,
      name: data.name || "",
      email: data.email || "",
      avatar: data.avatar || "",
      bio: data.bio || "",
      phone: data.phone || "",
      address: data.address || "",
      dateOfBirth: data.dob || "",
      gender: data.gender ? genderMapApiToUi[data.gender] || "" : "",
    };

    // Cập nhật localStorage với thông tin mới (user context dùng chung)
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = {
      ...currentUser,
      name: mapped.name,
      email: mapped.email,
      avatar: mapped.avatar,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return mapped;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw error;
  }
};

/**
 * Đổi mật khẩu
 * (Hiện BE chưa có endpoint /api/user/change-password – phần này để dành, chưa dùng cũng không sao)
 * @param {Object} passwordData
 * @param {string} passwordData.currentPassword - Mật khẩu hiện tại
 * @param {string} passwordData.newPassword - Mật khẩu mới
 * @returns {Promise}
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post("/user/change-password", passwordData);
    return response.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

/**
 * Upload avatar
 * BE: POST /api/me/avatar/upload  (multipart/form-data, field "file")
 * @param {File} file - File ảnh avatar
 * @returns {Promise} { avatarUrl: string }
 */
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    // BE expect key = "file"
    formData.append("file", file);

    const response = await api.post("/me/avatar/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = response.data?.data || {};
    const avatarUrl = data.avatar;

    // Cập nhật avatar trong localStorage
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    currentUser.avatar = avatarUrl;
    localStorage.setItem("user", JSON.stringify(currentUser));
    // Also cache avatar separately so FE can preserve it across logout/login
    try {
      localStorage.setItem("user_avatar", avatarUrl);
    } catch (e) {
      // ignore
    }

    // Giữ format cũ để Profile.jsx dùng result.avatarUrl
    return { avatarUrl };
  } catch (error) {
    console.error("Upload avatar error:", error);
    throw error;
  }
};