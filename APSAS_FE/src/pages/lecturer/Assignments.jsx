import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Book,
  BarChart3,
  CalendarDays,
  PenSquare,
  ChevronsRight,
  X,
} from "lucide-react";
import {
  lecturerAssignments,
  lecturerCourseSummary,
} from "../../constants/lecturerAssignments";

const statusBadge = {
  completed: "text-emerald-400 bg-emerald-500/10",
  "in-progress": "text-amber-400 bg-amber-500/10",
  "not-started": "text-gray-400 bg-white/5",
};

export default function LecturerAssignments() {
  const navigate = useNavigate();
  const assignments = useMemo(() => lecturerAssignments, []);
  const [deadlineModal, setDeadlineModal] = useState({
    open: false,
    assignment: null,
    date: "",
    time: "23:59",
  });

  const openDeadlineModal = (assignment) => {
    setDeadlineModal({
      open: true,
      assignment,
      date: assignment.deadline,
      time: "23:59",
    });
  };

  const closeDeadlineModal = () =>
    setDeadlineModal({ open: false, assignment: null, date: "", time: "23:59" });

  return (
    <div className="space-y-6">
      <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={18} />
              Teacher Detail
            </button>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-emerald-400 font-medium">Assignments</span>
          </div>
          <div className="text-sm text-blue-400 font-semibold">
            Tiến độ khóa học: {lecturerCourseSummary.progress}%
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-emerald-400 font-medium">
            {lecturerCourseSummary.title}
          </p>
          <h1 className="text-3xl font-bold text-white">
            {lecturerCourseSummary.title}
          </h1>
          <p className="text-gray-400">{lecturerCourseSummary.instructor}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Sinh viên</p>
              <p className="text-xl font-semibold text-white">
                {lecturerCourseSummary.totalStudents}
              </p>
            </div>
          </div>
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Book size={22} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bài học</p>
              <p className="text-xl font-semibold text-white">
                {lecturerCourseSummary.totalLessons}
              </p>
            </div>
          </div>
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <BarChart3 size={22} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Tiến độ TB</p>
              <p className="text-xl font-semibold text-white">
                {lecturerCourseSummary.avgProgress}%
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white">
            Bài tập
          </button>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition">
            Tổng quan
          </button>
        </div>
      </section>

      <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Danh sách bài tập</h2>
          <span className="text-sm text-gray-400">
            Tổng {assignments.length} bài tập
          </span>
        </div>

        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-2xl border border-[#202934] bg-[#0b0f12] p-5 space-y-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-400">Bài tập</p>
                  <h3 className="text-lg font-semibold text-white">
                    {assignment.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CalendarDays size={16} />
                    Deadline: {assignment.deadline}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusBadge[assignment.status]
                  }`}
                >
                  {assignment.statusLabel}
                </span>
              </div>

              <div className="text-sm text-gray-400">
                Đã nộp {assignment.submitted}/{assignment.total}
              </div>
              <div className="h-2 bg-[#10151c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${assignment.progress}%` }}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-emerald-400 font-semibold">
                  Điểm TB:{" "}
                  {assignment.avgScore != null ? `${assignment.avgScore}%` : "--"}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openDeadlineModal(assignment)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-white hover:border-emerald-500 transition"
                  >
                    <PenSquare size={16} />
                    Đặt deadline
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/lecturer/assignments/${assignment.id}`, {
                        state: { from: "/lecturer/assignments" },
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-black hover:bg-blue-400 transition"
                  >
                    Xem chi tiết
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {deadlineModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeDeadlineModal}
          ></div>
          <div className="relative bg-[#0f1419] border border-[#202934] rounded-2xl w-full max-w-md p-6 space-y-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Đặt deadline cho bài tập</h3>
                <p className="text-sm text-gray-400">
                  {deadlineModal.assignment?.title}
                </p>
              </div>
              <button
                onClick={closeDeadlineModal}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-gray-400">Ngày deadline</label>
              <input
                type="date"
                value={deadlineModal.date}
                onChange={(e) =>
                  setDeadlineModal((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full rounded-xl border border-[#202934] bg-transparent px-4 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm text-gray-400">Giờ deadline</label>
              <input
                type="time"
                value={deadlineModal.time}
                onChange={(e) =>
                  setDeadlineModal((prev) => ({ ...prev, time: e.target.value }))
                }
                className="w-full rounded-xl border border-[#202934] bg-transparent px-4 py-2 text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              className="w-full py-3 rounded-xl bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
              onClick={closeDeadlineModal}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
