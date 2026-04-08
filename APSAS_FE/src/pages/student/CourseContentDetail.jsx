import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  ListChecks,
  Clock,
  CalendarDays,
  FileText,
  Download,
  CheckCircle2,
} from "lucide-react";
import { getModuleDetail } from "../../constants/studentCourseModules";
import { lecturerAssignments } from "../../constants/lecturerAssignments";

const statusBadge = {
  completed: "text-emerald-400",
  review: "text-amber-400",
  locked: "text-gray-500",
};

export default function StudentCourseContentDetail() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const module = getModuleDetail(courseId, moduleId);

  useEffect(() => {
    if (!module) {
      navigate(`/student/my-courses/${courseId}`, { replace: true });
    }
  }, [module, courseId, navigate]);

  const assignmentDetail = useMemo(() => {
    if (!module || module.type !== "assignment" || !module.assignmentId) return null;
    return lecturerAssignments.find((item) => item.id === module.assignmentId);
  }, [module]);

  if (!module) return null;

  return (
    <div className="space-y-6 text-gray-100">
      <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/student/my-courses/${courseId}`)}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={18} />
              Quay lại khóa học
            </button>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-emerald-400 font-medium">Nội dung</span>
          </div>
          <div className="text-sm font-semibold uppercase tracking-wide">
            <span className={statusBadge[module.status] ?? "text-gray-400"}>
              {module.status === "completed"
                ? "ĐÃ HOÀN THÀNH"
                : module.status === "review"
                ? "CHỜ ĐÁNH GIÁ"
                : "CHƯA MỞ"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-emerald-400 font-medium">
            {module.type === "lesson" ? "Bài học" : "Bài tập"}
          </p>
          <h1 className="text-3xl font-bold text-white">{module.title}</h1>
          {module.summary && (
            <p className="text-gray-400 text-base">{module.summary}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          {module.type === "lesson" && module.duration && (
            <span className="inline-flex items-center gap-2">
              <Clock size={16} /> {module.duration}
            </span>
          )}
          {module.type === "assignment" && module.deadline && (
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} /> Deadline: {module.deadline}
            </span>
          )}
        </div>
      </section>

      <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-6">
        {module.type === "lesson" ? (
          <div className="space-y-6">
            <div className="aspect-video rounded-2xl overflow-hidden bg-[#06090c] border border-[#202934]">
              <iframe
                title={module.title}
                src={module.videoUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen"
              />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Play size={18} className="text-emerald-400" />
                Nội dung chính
              </h2>
              <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
                {module.content?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#202934] p-5 bg-[#11141d] space-y-4">
              <div className="flex items-center gap-3">
                <ListChecks size={22} className="text-emerald-400" />
                <div>
                  <p className="text-sm uppercase text-gray-400 tracking-wide">
                    Bài tập
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {assignmentDetail?.title ?? module.title}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  {module.content?.join(" ")}
                </p>
                {assignmentDetail?.description && (
                  <div
                    className="text-gray-300 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: assignmentDetail.description,
                    }}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    navigate(`/student/assignments/${module.assignmentId}`, {
                      state: {
                        from: `/student/my-courses/${courseId}/content/${module.id}`,
                      },
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-black text-sm font-semibold hover:bg-blue-400 transition"
                >
                  Xem bài nộp
                  <CheckCircle2 size={16} />
                </button>
                <button
                  onClick={() => navigate(`/student/my-courses/${courseId}?tab=assignments`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm font-medium hover:border-emerald-500 transition"
                >
                  Quản lý bài tập
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {module.resources?.length ? (
        <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            Tài nguyên liên quan
          </h3>
          <div className="space-y-3">
            {module.resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between rounded-xl border border-[#202934] bg-[#0b0f12] p-4"
              >
                <div>
                  <p className="text-white font-medium">{resource.label}</p>
                  <p className="text-xs text-gray-500">
                    {resource.type} • {resource.size}
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition">
                  <Download size={16} /> Tải xuống
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
