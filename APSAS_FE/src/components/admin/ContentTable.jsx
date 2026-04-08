function StatusPill({ s }) {
  const map = {
    pending: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    approved: "bg-green-500/15 text-green-300 border border-green-500/30",
    rejected: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs ${map[s]}`}>{s}</span>
  );
}

export default function ContentTable({ contents, onView }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm text-slate-300">
        <thead className="text-xs uppercase bg-[#0f141a] text-slate-400">
          <tr>
            <th className="px-3 py-3 text-left">ID</th>
            <th className="px-3 py-3 text-left">Tiêu đề</th>
            <th className="px-3 py-3 text-left">Loại</th>
            <th className="px-3 py-3 text-left">Tác giả</th>
            <th className="px-3 py-3 text-left">Nộp lúc</th>
            <th className="px-3 py-3 text-left">Trạng thái</th>
            <th className="px-3 py-3 text-right">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {contents.map((c) => (
            <tr
              key={c.id}
              className="border-t border-[#1f2937] hover:bg-white/5"
            >
              <td className="px-3 py-3">
                <span className="text-xs text-slate-500">{c.id}</span>
              </td>

              <td className="px-3 py-3">
                <div className="text-slate-100 line-clamp-1">{c.title}</div>
              </td>

              <td className="px-3 py-3">
                <span className="px-2 py-0.5 rounded-md text-xs bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {c.type}
                </span>
              </td>

              <td className="px-3 py-3">{c.author}</td>

              <td className="px-3 py-3">{c.submittedAt}</td>

              <td className="px-3 py-3">
                <StatusPill s={c.status} />
              </td>

              <td className="px-3 py-3 text-right">
                <button
                  className="px-2 py-1 rounded bg-[#101826] border border-[#223]"
                  onClick={() => onView(c)}
                >
                  Xem & xác nhận
                </button>
              </td>
            </tr>
          ))}

          {contents.length === 0 && (
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
