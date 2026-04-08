export default function UserToolbar({
  q,
  setQ,
  role,
  setRole,
  status,
  setStatus,
  onCreate,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm theo tên / email / ID"
        className="px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200 placeholder:text-slate-500 w-80 outline-none focus:border-sky-600"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200"
      >
        <option value="">Tất cả vai trò</option>
        <option value="student">Student</option>
        <option value="lecturer">Lecturer</option>
        <option value="provider">Provider</option>
        <option value="admin">Admin</option>
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200"
      >
        <option value="">Trạng thái</option>
        <option value="active">Đang hoạt động</option>
        <option value="blocked">Bị khóa</option>
      </select>

      <button
        onClick={onCreate}
        className="ml-auto px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white"
      >
        + Tạo người dùng
      </button>
    </div>
  );
}
