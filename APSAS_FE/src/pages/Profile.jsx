import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
} from "../services/userService";

const InfoRow = (props) => {
  const {
    isEditing,
    handleInputChange,
    label,
    value,
    field,
    type = "text",
    editable = true,
    options = [],
  } = props;

  useEffect(() => {
    console.log(`InfoRow mounted: ${field}`);
    return () => console.log(`InfoRow unmounted: ${field}`);
  }, [field]);

  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label}
      </label>
      {isEditing && editable ? (
        type === "select" ? (
          <select
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full bg-[#0b0f12] border border-[#202934] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            rows={3}
            className="w-full bg-[#0b0f12] border border-[#202934] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition resize-none"
            placeholder={`Nhập ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full bg-[#0b0f12] border border-[#202934] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
            placeholder={`Nhập ${label.toLowerCase()}...`}
          />
        )
      ) : (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b0f12] border border-[#202934] rounded-lg">
          <span className="text-white">{value || "—"}</span>
        </div>
      )}
    </div>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [formData, setFormData] = useState({
    avatar: "",
    name: "",
    bio: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    email: "",
  });

  // Load user profile khi component mount
  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Thử gọi API, nếu fail thì dùng data từ AuthContext
      try {
        const profileData = await getUserProfile(token);
        setFormData({
          avatar:
            profileData.avatar ||
            "https://ui-avatars.com/api/?name=User&background=10b981&color=fff",
          name: profileData.name || "",
          bio: profileData.bio || "",
          dateOfBirth: profileData.dateOfBirth || "",
          gender: profileData.gender || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          email: profileData.email || "",
        });
      } catch (apiError) {
        console.log("API not available, using local data");
        setFormData({
          avatar:
            user?.avatar ||
            "https://ui-avatars.com/api/?name=User&background=10b981&color=fff",
          name: user?.name || "Nguyễn Văn A",
          bio: user?.bio || "",
          dateOfBirth: user?.dateOfBirth || "01/01/2000",
          gender: user?.gender || "Nam",
          phone: user?.phone || "0123456789",
          address: user?.address || "Thành phố Hồ Chí Minh",
          email: user?.email || "user@example.com",
        });
      }
    } catch (err) {
      console.error("Load profile error:", err);
      setError("Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview avatar
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload avatar nếu đang edit mode
    if (isEditing) {
      try {
        setLoading(true);
        const result = await uploadAvatar(file);

        const newAvatar =
          result.avatarUrl || result.avatar || formData.avatar ||
          "https://ui-avatars.com/api/?name=User&background=10b981&color=fff";

        setFormData((prev) => ({ ...prev, avatar: newAvatar }));

        // Cập nhật global auth user => header/avatar update ngay lập tức
        if (typeof updateUser === "function") {
          updateUser({ avatar: newAvatar });
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error("Upload avatar error:", err);
        setError("Không thể upload avatar");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Gọi API để cập nhật profile
      const updatedData = await updateUserProfile({
        name: formData.name,
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        avatar: formData.avatar,
      });

      console.log("Profile updated successfully:", updatedData);
      setSuccess(true);
      setIsEditing(false);
      setAvatarPreview(null);

      // Update auth context với info mới
      if (typeof updateUser === "function") {
        const newUserInfo =
          updatedData?.user ||
          updatedData || {
            name: formData.name,
            email: formData.email,
            avatar: formData.avatar,
          };
        updateUser({
          name: newUserInfo.name,
          email: newUserInfo.email,
          avatar: newUserInfo.avatar,
        });
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update profile error:", err);
      setError(
        err.response?.data?.message ||
          "Không thể cập nhật profile. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f12] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[800px]">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Quay lại</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Hồ sơ cá nhân</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Chỉnh sửa
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <svg
              className="w-5 h-5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
            <svg
              className="w-5 h-5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Cập nhật thông tin thành công!
          </div>
        )}

        {loading ? (
          <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-16 text-center text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
            <p>Đang tải thông tin...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Avatar Card */}
            <div className="bg-[#0f1419] border border-[#202934] rounded-xl overflow-hidden">
              <div className="relative bg-linear-to-br from-emerald-500/10 to-blue-500/10 p-8 text-center">
                <div className="relative inline-block">
                  <img
                    src={
                      avatarPreview ||
                      formData.avatar ||
                      "https://ui-avatars.com/api/?name=User&background=10b981&color=fff"
                    }
                    alt="Avatar"
                    className="w-32 h-32 rounded-full border-4 border-[#0f1419] object-cover shadow-xl"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-black p-2.5 rounded-full cursor-pointer shadow-lg transition">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-bold text-white">
                  {formData.name || "Người dùng"}
                </h2>
                <p className="text-gray-400 text-sm">{formData.email}</p>
              </div>
            </div>

            {/* Information Card */}
            <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">
                Thông tin cá nhân
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow
                    isEditing={isEditing}
                    handleInputChange={handleInputChange}
                    label="Họ và tên"
                    value={formData.name}
                    field="name"
                  />
                  <InfoRow
                    isEditing={isEditing}
                    handleInputChange={handleInputChange}
                    label="Email"
                    value={formData.email}
                    field="email"
                    type="email"
                    editable={false}
                  />
                  <InfoRow
                    isEditing={isEditing}
                    handleInputChange={handleInputChange}
                    label="Số điện thoại"
                    value={formData.phone}
                    field="phone"
                    type="tel"
                  />
                  <InfoRow
                    isEditing={isEditing}
                    handleInputChange={handleInputChange}
                    label="Giới tính"
                    value={formData.gender}
                    field="gender"
                    type="select"
                    options={["Nam", "Nữ", "Khác"]}
                  />
                  <InfoRow
                    isEditing={isEditing}
                    handleInputChange={handleInputChange}
                    label="Ngày sinh"
                    value={formData.dateOfBirth}
                    field="dateOfBirth"
                    type="date"
                  />
                </div>

                <InfoRow
                  isEditing={isEditing}
                  handleInputChange={handleInputChange}
                  label="Địa chỉ"
                  value={formData.address}
                  field="address"
                />

                <InfoRow
                  isEditing={isEditing}
                  handleInputChange={handleInputChange}
                  label="Giới thiệu bản thân"
                  value={formData.bio}
                  field="bio"
                  type="textarea"
                />

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 justify-end pt-4 border-t border-[#202934]">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setAvatarPreview(null);
                        loadUserProfile();
                      }}
                      className="px-6 py-2.5 bg-[#0b0f12] border border-[#202934] hover:border-gray-600 text-white font-medium rounded-lg transition"
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
