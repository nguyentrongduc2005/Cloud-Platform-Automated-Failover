export default function ContentToolbar({
  q,
  setQ,
  type,
  setType,
  status,
  setStatus,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm theo tiêu đề / tác giả / ID"
        className="px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200 placeholder:text-slate-500 w-80 outline-none focus:border-sky-600"
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200"
      >
        <option value="">Tất cả loại</option>
        <option value="VIDEO">Video</option>
        <option value="PDF">PDF</option>
        <option value="QUIZ">Quiz</option>
        <option value="EXERCISE">Exercise</option>
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200"
      >
        <option value="">Tất cả</option>
        <option value="pending">Chờ duyệt</option>
        <option value="approved">Đã duyệt</option>
        <option value="rejected">Từ chối</option>
      </select>
    </div>
  );
}
