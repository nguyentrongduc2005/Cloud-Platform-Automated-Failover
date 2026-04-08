export default function CourseProgressCard({ course }) {
  return (
    <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-5 hover:border-emerald-500/50 transition">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-white font-semibold mb-1">{course.title}</h4>
          <p className="text-gray-400 text-sm">{course.subtitle}</p>
        </div>
        <div className="text-emerald-400 font-bold text-lg">
          {course.progress}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[#0b0f12] rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${course.progress}%` }}
        />
      </div>
    </div>
  );
}
