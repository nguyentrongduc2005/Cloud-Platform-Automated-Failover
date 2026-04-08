import { useState, useEffect } from "react";
import { X, Search, Check } from "lucide-react";

/**
 * Modal for creating/editing roles with permission selection
 * @param {Object} props
 * @param {boolean} props.open - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSave - Save handler (receives roleData)
 * @param {Object|null} props.role - Role to edit (null for create)
 * @param {Array} props.allPermissions - All available permissions
 */
export default function RoleEditModal({ open, onClose, onSave, role, allPermissions = [] }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    permissionNames: [],
  });
  const [permSearch, setPermSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset form when role changes
  useEffect(() => {
    if (role) {
      setForm({
        name: role.name || "",
        description: role.description || "",
        permissionNames: role.permissions?.map((p) => p.name) || [],
      });
    } else {
      setForm({
        name: "",
        description: "",
        permissionNames: [],
      });
    }
    setPermSearch("");
  }, [role, open]);

  // Filter permissions by search
  const filteredPermissions = allPermissions.filter(
    (perm) =>
      perm.name?.toLowerCase().includes(permSearch.toLowerCase()) ||
      perm.description?.toLowerCase().includes(permSearch.toLowerCase())
  );

  // Group permissions by category (first part of name before _)
  const groupedPermissions = filteredPermissions.reduce((groups, perm) => {
    const category = perm.name?.split("_")[0] || "OTHER";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(perm);
    return groups;
  }, {});

  // Toggle permission selection
  const togglePermission = (permName) => {
    setForm((prev) => ({
      ...prev,
      permissionNames: prev.permissionNames.includes(permName)
        ? prev.permissionNames.filter((name) => name !== permName)
        : [...prev.permissionNames, permName],
    }));
  };

  // Select all permissions in a category
  const toggleCategory = (category) => {
    const categoryPermNames = groupedPermissions[category]?.map((p) => p.name) || [];
    const allSelected = categoryPermNames.every((name) => form.permissionNames.includes(name));

    if (allSelected) {
      // Deselect all in category
      setForm((prev) => ({
        ...prev,
        permissionNames: prev.permissionNames.filter((name) => !categoryPermNames.includes(name)),
      }));
    } else {
      // Select all in category
      setForm((prev) => ({
        ...prev,
        permissionNames: [...new Set([...prev.permissionNames, ...categoryPermNames])],
      }));
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên vai trò");
      return;
    }

    try {
      setSaving(true);
      await onSave(form);
    } catch (error) {
      console.error("Error saving role:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-[#0b0f14] border border-[#1e2630] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#202934] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {role ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#202934] rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Tên vai trò <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                placeholder="VD: MODERATOR"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0d1117] border border-[#202934] text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
              <p className="text-xs text-gray-500 mt-1">Tên vai trò phải viết hoa, không dấu</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Mô tả</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="VD: Người kiểm duyệt nội dung"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0d1117] border border-[#202934] text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Permissions Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">
                Quyền hạn ({form.permissionNames.length} đã chọn)
              </label>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder="Tìm quyền..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d1117] border border-[#202934] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Permission Groups */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.keys(groupedPermissions).sort().map((category) => {
                const categoryPerms = groupedPermissions[category];
                const selectedCount = categoryPerms.filter((p) =>
                  form.permissionNames.includes(p.name)
                ).length;
                const allSelected = selectedCount === categoryPerms.length;

                return (
                  <div
                    key={category}
                    className="bg-[#0d1117] border border-[#202934] rounded-lg overflow-hidden"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#151b23] transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                            allSelected
                              ? "bg-emerald-500 border-emerald-500"
                              : selectedCount > 0
                              ? "bg-emerald-500/30 border-emerald-500"
                              : "border-gray-600"
                          }`}
                        >
                          {(allSelected || selectedCount > 0) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium text-white">{category}</span>
                        <span className="text-xs text-gray-500">
                          ({selectedCount}/{categoryPerms.length})
                        </span>
                      </div>
                    </button>

                    {/* Category Permissions */}
                    <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryPerms.map((perm) => {
                        const isSelected = form.permissionNames.includes(perm.name);
                        return (
                          <button
                            key={perm.id}
                            onClick={() => togglePermission(perm.name)}
                            className={`flex items-start gap-3 p-2 rounded-lg text-left transition ${
                              isSelected
                                ? "bg-emerald-500/10 border border-emerald-500/30"
                                : "hover:bg-[#151b23] border border-transparent"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition ${
                                isSelected
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "border-gray-600"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-mono text-gray-300 truncate">
                                {perm.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {perm.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {Object.keys(groupedPermissions).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không tìm thấy quyền nào
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#202934] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#202934] text-gray-300 hover:bg-[#2a3441] transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {saving && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {role ? "Lưu thay đổi" : "Tạo vai trò"}
          </button>
        </div>
      </div>
    </div>
  );
}

