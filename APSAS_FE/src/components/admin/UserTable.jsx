const roleColor = {
  admin: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  lecturer: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  teacher: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  student: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  provider: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
};

function Badge({ children, tone = "blue", className = "" }) {
  const map = {
    green: "bg-green-500/15 text-green-300 border border-green-500/30",
    red: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    gray: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
    blue: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs ${map[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default function UserTable({ users, onEdit, onToggleLock, onDelete }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm text-slate-300">
        <thead className="text-xs uppercase bg-[#0f141a] text-slate-400">
          <tr>
            <th className="px-3 py-3 text-left">Người dùng</th>
            <th className="px-3 py-3 text-left">Email</th>
            <th className="px-3 py-3 text-left">Vai trò</th>
            <th className="px-3 py-3 text-left">Trạng thái</th>
            <th className="px-3 py-3 text-left">Ngày tạo</th>
            <th className="px-3 py-3 text-left">Hoạt động gần</th>
            <th className="px-3 py-3 text-right">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-t border-[#1f2937] hover:bg-white/5"
            >
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center text-xs">
                    {u.name.split(" ").slice(-1)[0][0]}
                  </div>
                  <div className="leading-tight">
                    <div className="text-slate-100">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.id}</div>
                  </div>
                </div>
              </td>

              <td className="px-3 py-3">{u.email}</td>

              <td className="px-3 py-3">
                <span
                  className={`px-2 py-0.5 rounded-md text-xs ${
                    roleColor[u.role]
                  }`}
                >
                  {u.role}
                </span>
              </td>

              <td className="px-3 py-3">
                {(() => {
                  const status = (u.status || "").toUpperCase();
                  if (status === "ACTIVE") {
                    return <Badge tone="green">Active</Badge>;
                  } else if (status === "BLOCKED") {
                    return <Badge tone="red">Blocked</Badge>;
                  } else if (status === "INACTIVE") {
                    return <Badge tone="gray">Inactive</Badge>;
                  } else if (status === "BANNED") {
                    return <Badge tone="red">Banned</Badge>;
                  } else {
                    return <Badge tone="gray">{u.status || "Unknown"}</Badge>;
                  }
                })()}
                {!u.verified && (
                  <Badge tone="gray" className="ml-2">
                    Unverified
                  </Badge>
                )}
              </td>

              <td className="px-3 py-3">{u.createdAt}</td>
              <td className="px-3 py-3">{u.lastLogin || "-"}</td>

              <td className="px-3 py-3 text-right">
                <div className="inline-flex gap-2">
                  <button
                    className="px-2 py-1 rounded bg-[#101826] border border-[#223]"
                    onClick={() => onEdit(u)}
                  >
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-[#101826] border border-[#223]"
                    onClick={() => onToggleLock(u.id)}
                  >
                    {(() => {
                      const status = (u.status || "").toUpperCase();
                      if (status === "ACTIVE") {
                        return "Khóa";
                      } else if (status === "BLOCKED" || status === "INACTIVE" || status === "BANNED") {
                        return "Mở khóa";
                      } else {
                        return "Khóa";
                      }
                    })()}
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-[#2a0e12] border border-rose-900 text-rose-300"
                    onClick={() => onDelete(u.id)}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-6 text-slate-500">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
