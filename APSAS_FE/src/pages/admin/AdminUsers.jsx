// src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from "react";
import adminUserService from "../../services/adminUserService";
import UserToolbar from "../../components/admin/UserToolbar";
import UserTable from "../../components/admin/UserTable";
import UserEditModal from "../../components/admin/UserEditModal";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, data: null });
  const [stats, setStats] = useState(null);

  // Fetch users with pagination
  const fetchUsers = async (page = 0) => {
    try {
      setLoading(true);
      const result = await adminUserService.getUsers({
        page,
        size: 10,
        keyword: search, // API uses 'keyword' for search
        roleId: role ? getRoleIdByName(role) : undefined, // API uses 'roleId' (number)
        status: status ? status.toUpperCase() : undefined,
      });

      // API returns: { code, message, data: { content, totalElements, totalPages, size, number } }
      if (result.code === "ok" && result.data) {
        setUsers(result.data.content || []);
        setPagination({
          page: result.data.number || 0,
          size: result.data.size || 10,
          totalElements: result.data.totalElements || 0,
          totalPages: result.data.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert role name to role ID
  const getRoleIdByName = (roleName) => {
    const roleMap = {
      ADMIN: 1,
      STUDENT: 2,
      LECTURER: 3,
      CONTENT_PROVIDER: 4,
      PROVIDER: 4,
      GUEST: 5,
    };
    return roleMap[roleName.toUpperCase()] || undefined;
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const result = await adminUserService.getUserStatistics();
      if (result.code === "ok" && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchUsers(0);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, status]);

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  const openCreate = () => setModal({ open: true, data: null });
  const openEdit = (u) => setModal({ open: true, data: u });
  const closeModal = () => setModal({ open: false, data: null });

  const saveUser = async (data) => {
    try {
      if (modal.data) {
        // Update user roles or status
        if (data.role) {
          // Send role name directly as array
          const roleName = data.role.toUpperCase();
          await adminUserService.updateUserRoles(modal.data.id, [roleName]);
        }
        if (data.status) {
          await adminUserService.updateUserStatus(modal.data.id, data.status);
        }
        await fetchUsers(pagination.page);
      } else {
        // Create new user - build payload expected by backend
        // API expects: { name, email, password, roleNames, status }
        const roleName = data.role ? data.role.toUpperCase() : "STUDENT";
        const payload = {
          name:
            data.name ||
            `${data.firstName || ""} ${data.lastName || ""}`.trim(),
          email: data.email,
          password: data.password,
          roleNames: [roleName], // Default to STUDENT
          status: data.status || "ACTIVE",
        };

        const response = await adminUserService.createUser(payload);
        if (response.code === "ok") {
          await fetchUsers(0); // Refresh to first page
        }
      }
      closeModal();
      await fetchStats(); // Refresh statistics
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMsg =
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        "Lưu thất bại";
      alert(errorMsg);
    }
  };

  /**
   * Toggle user lock status (Block/Unblock)
   * Block: ACTIVE → BLOCKED
   * Unblock: BLOCKED/INACTIVE/BANNED → ACTIVE
   */
  const toggleLock = async (id) => {
    try {
      const user = users.find((u) => u.id === id);
      if (!user) {
        alert("Không tìm thấy người dùng");
        return;
      }

      const currentStatus = (user.status || "").toUpperCase();
      let newStatus;
      let actionText;

      if (currentStatus === "ACTIVE") {
        // Block user
        newStatus = "BLOCKED";
        actionText = "khóa";
        if (!window.confirm(`Bạn có chắc chắn muốn khóa người dùng "${user.name}"?`)) {
          return;
        }
      } else {
        // Unblock user (from BLOCKED, INACTIVE, or BANNED)
        newStatus = "ACTIVE";
        actionText = "mở khóa";
        if (!window.confirm(`Bạn có chắc chắn muốn mở khóa người dùng "${user.name}"?`)) {
          return;
        }
      }

      const response = await adminUserService.updateUserStatus(id, newStatus);

      if (response.code === "ok") {
        alert(`Đã ${actionText} người dùng thành công!`);
        await fetchUsers(pagination.page);
        await fetchStats();
      } else {
        throw new Error(response.message || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      const errorMsg = error.response?.data?.message || error.message || "Thao tác thất bại";
      alert(errorMsg);
    }
  };

  const removeUser = async (id) => {
    if (
      !window.confirm("Xóa người dùng này? Hành động này không thể hoàn tác.")
    )
      return;

    try {
      const response = await adminUserService.deleteUser(id);
      if (response.code === "ok") {
        await fetchUsers(pagination.page);
        await fetchStats();
        alert("Xóa người dùng thành công");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMsg = error.response?.data?.message || "Xóa thất bại";
      alert(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Quản lý người dùng</h1>
        <p className="text-gray-400 mt-1">
          Quản lý tài khoản và phân quyền người dùng trong hệ thống
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-5">
            <div className="text-sm text-gray-400">Tổng người dùng</div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats.totalUsers}
            </div>
          </div>
          <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-5">
            <div className="text-sm text-gray-400">Đang hoạt động</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {stats.activeUsers}
            </div>
          </div>
          <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-5">
            <div className="text-sm text-gray-400">Sinh viên</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {stats.usersByRole?.STUDENT || stats.studentsCount || 0}
            </div>
          </div>
          <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-5">
            <div className="text-sm text-gray-400">Giảng viên</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">
              {stats.usersByRole?.LECTURER || stats.lecturersCount || 0}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-6">
        <UserToolbar
          q={search}
          setQ={setSearch}
          role={role}
          setRole={setRole}
          status={status}
          setStatus={setStatus}
          onCreate={openCreate}
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Đang tải...</p>
          </div>
        ) : (
          <>
            <UserTable
              users={users}
              onEdit={openEdit}
              onToggleLock={toggleLock}
              onDelete={removeUser}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#202934]">
                <div className="text-sm text-gray-400">
                  Hiển thị {users.length} trong tổng số{" "}
                  {pagination.totalElements} người dùng
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className="px-3 py-1.5 bg-[#0b0f12] border border-[#202934] rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#202934] transition"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-gray-400">
                    Trang {pagination.page + 1} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages - 1}
                    className="px-3 py-1.5 bg-[#0b0f12] border border-[#202934] rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#202934] transition"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <UserEditModal
        open={modal.open}
        onClose={closeModal}
        onSave={saveUser}
        user={modal.data}
      />
    </div>
  );
}
