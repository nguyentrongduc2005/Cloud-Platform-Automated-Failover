import React from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, Clock } from "lucide-react";

/**
 * Card hiển thị khóa học cho Student
 * @param {Object} course - Thông tin khóa học
 */
export default function StudentCourseCard({ course }) {
  const {
    id,
    title = "Lập trình Java",
    thumbnail = "/images/course-java.png",
    language = "Public",
    instructor = "TS. Trần Minh Quân", // Tên giảng viên
    instructorAvatar = "/images/avatar-default.png",
    studentCount = 45,
    lessonCount = 13,
    duration = 18,
    progress = 100,
  } = course || {};

  return (
    <Link
      to={`/student/my-courses/${id}`}
      className="block relative rounded-2xl bg-[#1a2332] border border-[#2a3441] hover:border-emerald-400/40 transition overflow-hidden"
    >
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
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Tỉ lệ hoàn phí</span>
            <span className="font-semibold text-emerald-400">{progress}%</span>
          </div>
          <div className="h-2 bg-[#0f1621] rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Instructor Info - CHỈ CÓ Ở STUDENT CARD */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#2a3441]">
          <img
            src={instructorAvatar}
            alt={instructor}
            className="h-8 w-8 rounded-full bg-white/10 object-cover"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-300 truncate">{instructor}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
