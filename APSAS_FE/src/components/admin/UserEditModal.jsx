import { useState, useEffect } from "react";

export default function UserEditModal({ open, onClose, onSave, user }) {
  const [form, setForm] = useState(
    user ?? {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
      status: "ACTIVE",
    }
  );

  useEffect(() => {
    if (user) {
      // Normalize incoming user object to form shape
      // API returns { id, name, email, status, roles: [{ id, name }] }
      const userRole = user.roles?.[0]?.name || user.role || "STUDENT";
      setForm({
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || "",
        email: user.email || "",
        password: "",
        role: typeof userRole === 'string' ? userRole.toUpperCase() : "STUDENT",
        status: (user.status && user.status.toUpperCase()) || "ACTIVE",
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        status: "ACTIVE",
      });
    }
  }, [user, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-[720px] rounded-xl bg-[#0b0f14] border border-[#1e2630] p-5">
        <h3 className="text-slate-100 text-lg font-semibold">
          {user ? "Sửa người dùng" : "Tạo người dùng mới"}
        </h3>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="col-span-2">
            <label className="text-sm text-slate-400">Họ và tên</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nhập họ và tên"
              className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              disabled={!!user} // Disable email editing for existing users
              className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Vai trò</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200"
            >
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="CONTENT_PROVIDER">Content Provider</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {!user && (
            <div>
              <label className="text-sm text-slate-400">
                Mật khẩu <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Tối thiểu 8 ký tự"
                className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200"
              />
              <p className="text-xs text-slate-500 mt-1">
                Chứa chữ hoa, chữ thường, số và ký tự đặc biệt
              </p>
            </div>
          )}

          <div>
            <label className="text-sm text-slate-400">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-3 py-2 rounded-md bg-slate-700/50 text-slate-200"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white"
            onClick={() => onSave(form)}
          >
            {user ? "Lưu" : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}
