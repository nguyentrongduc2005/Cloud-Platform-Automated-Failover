import React from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, Clock, FileText, Settings } from "lucide-react";

/**
 * Card hiển thị khóa học cho Lecturer
 * @param {Object} course - Thông tin khóa học
 */
export default function LecturerCourseCard({ course }) {
  const {
    id,
    title = "Lập trình Java",
    thumbnail = "/images/course-java.png",
    language = "Public",
    studentCount = 45,
    lessonCount = 13,
    duration = 18,
    progress = 100,
  } = course || {};

  return (
    <div className="relative rounded-2xl bg-[#1a2332] border border-[#2a3441] hover:border-emerald-400/40 transition overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Badge Language */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-black text-xs font-semibold rounded-full">
            {language}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-white text-lg mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{studentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={14} />
            <span>{lessonCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{duration}h</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Tỉ lệ hoàn thành</span>
            <span className="font-semibold text-emerald-400">{progress}%</span>
          </div>
          <div className="h-2 bg-[#0f1621] rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/lecturer/courses/${id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-sm font-medium rounded-lg transition-colors"
          >
            <BookOpen size={14} />
            Tổng quan
          </Link>
          <Link
            to={`/lecturer/courses/${id}/assignments`}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 text-sm font-medium rounded-lg transition-colors"
          >
            <FileText size={14} />
            Bài tập
          </Link>
          <Link
            to={`/lecturer/courses/${id}/settings`}
            className="flex items-center justify-center p-2 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 hover:border-slate-500/40 text-slate-400 rounded-lg transition-colors"
          >
            <Settings size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
