import { useState, useEffect } from "react";

export default function ContentViewModal({ open, onClose, data, onDecision }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && data) {
      setNote(data.note || "");
    }
  }, [open, data]);

  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="w-[800px] rounded-xl bg-[#0b0f14] border border-[#1e2630] p-5">
        <h3 className="text-slate-100 text-lg font-semibold">
          Xem & xác nhận nội dung
        </h3>

        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <div className="text-slate-400">ID</div>
            <div className="text-slate-200">{data.id}</div>
          </div>

          <div>
            <div className="text-slate-400">Loại</div>
            <div className="text-slate-200">{data.type}</div>
          </div>

          <div className="col-span-2">
            <div className="text-slate-400">Tiêu đề</div>
            <div className="text-slate-200">{data.title}</div>
          </div>

          <div>
            <div className="text-slate-400">Tác giả</div>
            <div className="text-slate-200">{data.author}</div>
          </div>

          <div>
            <div className="text-slate-400">Nộp lúc</div>
            <div className="text-slate-200">{data.submittedAt}</div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm text-slate-400">Ghi chú phản hồi</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md bg-[#0d1117] border border-[#223] text-slate-200"
            placeholder="(Không bắt buộc)"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-3 py-2 rounded-md bg-slate-700/50 text-slate-200"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            className="px-3 py-2 rounded-md bg-rose-600 text-white"
            onClick={() => onDecision("rejected", note)}
          >
            Từ chối
          </button>
          <button
            className="px-3 py-2 rounded-md bg-emerald-600 text-white"
            onClick={() => onDecision("approved", note)}
          >
            Duyệt
          </button>
        </div>
      </div>
    </div>
  );
}
