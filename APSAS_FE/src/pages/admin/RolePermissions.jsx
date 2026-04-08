import { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Eye, Shield, Key } from "lucide-react";
import rolePermissionService from "../../services/rolePermissionService";
import RoleEditModal from "../../components/admin/RoleEditModal";

function RolePermissions() {
  const [activeTab, setActiveTab] = useState("roles");
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");

  // Modal states
  const [editModal, setEditModal] = useState({ open: false, role: null });
  const [detailModal, setDetailModal] = useState({ open: false, role: null });

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await rolePermissionService.getRoles();
      if (response.code === "ok" && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      alert("Không thể tải danh sách vai trò");
    } finally {
      setLoading(false);
    }
  };

  // Fetch permissions from API
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await rolePermissionService.getPermissions();
      if (response.code === "ok" && response.data) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      alert("Không thể tải danh sách quyền");
    } finally {
      setLoading(false);
    }
  };

  // Fetch both on mount
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Refetch when tab changes
  useEffect(() => {
    if (activeTab === "roles") {
      fetchRoles();
    }
  }, [activeTab]);

  // Filter roles by search
  const filteredRoles = roles.filter(
    (role) =>
      role.name?.toLowerCase().includes(roleSearch.toLowerCase()) ||
      role.description?.toLowerCase().includes(roleSearch.toLowerCase())
  );

  // Filter permissions by search
  const filteredPermissions = permissions.filter(
    (perm) =>
      perm.name?.toLowerCase().includes(permSearch.toLowerCase()) ||
      perm.description?.toLowerCase().includes(permSearch.toLowerCase())
  );

  // Open create modal
  const openCreateModal = () => {
    setEditModal({ open: true, role: null });
  };

  // Open edit modal
  const openEditModal = async (role) => {
    try {
      // Fetch full role details with permissions
      const response = await rolePermissionService.getRoleById(role.id);
      if (response.code === "ok" && response.data) {
        setEditModal({ open: true, role: response.data });
      }
    } catch (error) {
      console.error("Error fetching role details:", error);
      alert("Không thể tải thông tin vai trò");
    }
  };

  // Open detail modal
  const openDetailModal = async (role) => {
    try {
      const response = await rolePermissionService.getRoleById(role.id);
      if (response.code === "ok" && response.data) {
        setDetailModal({ open: true, role: response.data });
      }
    } catch (error) {
      console.error("Error fetching role details:", error);
      alert("Không thể tải thông tin vai trò");
    }
  };

  // Close modals
  const closeEditModal = () => setEditModal({ open: false, role: null });
  const closeDetailModal = () => setDetailModal({ open: false, role: null });

  // Save role (create or update)
  const handleSaveRole = async (formData) => {
    try {
      if (editModal.role) {
        // Update existing role
        const response = await rolePermissionService.updateRole(
          editModal.role.id,
          formData
        );
        if (response.code === "ok") {
          alert("Cập nhật vai trò thành công!");
          closeEditModal();
          fetchRoles();
        } else {
          throw new Error(response.message || "Cập nhật thất bại");
        }
      } else {
        // Create new role
        const response = await rolePermissionService.createRole(formData);
        if (response.code === "ok") {
          alert("Tạo vai trò thành công!");
          closeEditModal();
          fetchRoles();
        } else {
          throw new Error(response.message || "Tạo vai trò thất bại");
        }
      }
    } catch (error) {
      console.error("Error saving role:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Lưu thất bại";
      alert(errorMsg);
      throw error;
    }
  };

  // Delete role
  const handleDeleteRole = async (role) => {
    if (role.userCount > 0) {
      alert(
        `Không thể xóa vai trò "${role.name}" vì đang có ${role.userCount} người dùng sử dụng.`
      );
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
      return;
    }

    try {
      const response = await rolePermissionService.deleteRole(role.id);
      if (response.code === "ok") {
        alert("Xóa vai trò thành công!");
        fetchRoles();
      } else {
        throw new Error(response.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Xóa thất bại";
      alert(errorMsg);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (roleName) => {
    const colors = {
      ADMIN: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      STUDENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      LECTURER: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      CONTENT_PROVIDER: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      GUEST: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return (
      colors[roleName] ||
      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Quản lý Role & Permission</h1>
            <p className="text-gray-400 text-sm">
              Quản lý vai trò và phân quyền truy cập trong hệ thống
            </p>
          </div>
          {activeTab === "roles" && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Tạo vai trò mới
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Tổng vai trò</div>
                <div className="text-2xl font-bold text-white">
                  {roles.length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Tổng quyền</div>
                <div className="text-2xl font-bold text-white">
                  {permissions.length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Tổng người dùng</div>
                <div className="text-2xl font-bold text-white">
                  {roles.reduce((sum, r) => sum + (r.userCount || 0), 0)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">
                  Vai trò có người dùng
                </div>
                <div className="text-2xl font-bold text-white">
                  {roles.filter((r) => r.userCount > 0).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-[#0b0f12] border border-[#202934] rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "roles"
                ? "bg-[#0f1419] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Vai trò ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "permissions"
                ? "bg-[#0f1419] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Quyền hạn ({permissions.length})
          </button>
        </div>

        {/* Content */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-2xl overflow-hidden">
          {activeTab === "roles" ? (
            <>
              {/* Roles Header */}
              <div className="px-6 py-4 border-b border-[#202934] bg-[#0f1419]">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Tìm kiếm vai trò..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      className="w-full bg-[#0b0f12] border border-[#202934] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    <svg
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Roles Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 mt-4">Đang tải...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0f1419] border-b border-[#202934]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Tên vai trò
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Mô tả
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Số người dùng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Số quyền
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202934]">
                      {filteredRoles.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-8 text-center text-gray-400"
                          >
                            Không tìm thấy vai trò nào
                          </td>
                        </tr>
                      ) : (
                        filteredRoles.map((role) => (
                          <tr
                            key={role.id}
                            className="hover:bg-[#0f1419] transition"
                          >
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                                  role.name
                                )}`}
                              >
                                {role.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-400">
                                {role.description || "-"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Users className="w-4 h-4" />
                                <span>{role.userCount || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-300">
                                {role.permissions?.length || 0} quyền
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-500">
                                {role.createdAt
                                  ? new Date(role.createdAt).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "-"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openDetailModal(role)}
                                  className="p-2 hover:bg-[#202934] rounded-lg transition"
                                  title="Xem chi tiết"
                                >
                                  <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                                </button>
                                <button
                                  onClick={() => openEditModal(role)}
                                  className="p-2 hover:bg-[#202934] rounded-lg transition"
                                  title="Chỉnh sửa"
                                >
                                  <Edit2 className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRole(role)}
                                  className="p-2 hover:bg-[#202934] rounded-lg transition"
                                  title="Xóa"
                                  disabled={role.userCount > 0}
                                >
                                  <Trash2
                                    className={`w-4 h-4 ${
                                      role.userCount > 0
                                        ? "text-gray-600 cursor-not-allowed"
                                        : "text-rose-400 hover:text-rose-300"
                                    }`}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Permissions Header */}
              <div className="px-6 py-4 border-b border-[#202934] bg-[#0f1419]">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Tìm kiếm quyền..."
                      value={permSearch}
                      onChange={(e) => setPermSearch(e.target.value)}
                      className="w-full bg-[#0b0f12] border border-[#202934] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    <svg
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-400">
                    {filteredPermissions.length} quyền
                  </span>
                </div>
              </div>

              {/* Permissions Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 mt-4">Đang tải...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0f1419] border-b border-[#202934]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Tên quyền
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Mô tả
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202934]">
                      {filteredPermissions.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-8 text-center text-gray-400"
                          >
                            Không tìm thấy quyền nào
                          </td>
                        </tr>
                      ) : (
                        filteredPermissions.map((permission) => (
                          <tr
                            key={permission.id}
                            className="hover:bg-[#0f1419] transition"
                          >
                            <td className="px-6 py-4">
                              <span className="text-xs font-mono text-gray-500 bg-[#0f1419] px-2 py-1 rounded">
                                #{permission.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-emerald-400 font-mono">
                                {permission.name}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-400">
                                {permission.description || "-"}
                              </p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Role Edit Modal */}
      <RoleEditModal
        open={editModal.open}
        onClose={closeEditModal}
        onSave={handleSaveRole}
        role={editModal.role}
        allPermissions={permissions}
      />

      {/* Role Detail Modal */}
      {detailModal.open && detailModal.role && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-xl bg-[#0b0f14] border border-[#1e2630] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#202934] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                    detailModal.role.name
                  )}`}
                >
                  {detailModal.role.name}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-400 text-sm">
                  {detailModal.role.description}
                </span>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-1 hover:bg-[#202934] rounded-lg transition"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="px-6 py-4 border-b border-[#202934] flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  {detailModal.role.userCount || 0} người dùng
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  {detailModal.role.permissions?.length || 0} quyền
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                Ngày tạo:{" "}
                {detailModal.role.createdAt
                  ? new Date(detailModal.role.createdAt).toLocaleDateString(
                      "vi-VN"
                    )
                  : "-"}
              </div>
            </div>

            {/* Permissions List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Danh sách quyền ({detailModal.role.permissions?.length || 0})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {detailModal.role.permissions?.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-start gap-3 p-3 bg-[#0d1117] border border-[#202934] rounded-lg"
                  >
                    <Key className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-white truncate">
                        {perm.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                ))}
                {(!detailModal.role.permissions ||
                  detailModal.role.permissions.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    Vai trò này chưa có quyền nào
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#202934] flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  closeDetailModal();
                  openEditModal(detailModal.role);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 rounded-lg bg-[#202934] text-gray-300 hover:bg-[#2a3441] transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolePermissions;
