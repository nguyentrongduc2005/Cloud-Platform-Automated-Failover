import { Edit } from "lucide-react";
import StatsCard from "./StatsCard";

export default function ProfileHeader({ user, stats, onEditClick }) {
  const avgRaw = stats?.completionRate ?? stats?.averageScore ?? 0;
  const avgDisplay = `${Math.round(Number(avgRaw) || 0)}%`;
  return (
    <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        {/* Avatar and Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "Avatar"}
                className="w-20 h-20 rounded-full object-cover"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || "N"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {user?.name || "Nguyễn Văn A"}
            </h1>
            <p className="text-gray-400 text-sm">
              Sinh viên • Email: {user?.email || "student@example.com"}
            </p>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={onEditClick}
          className="p-2 hover:bg-[#202934] rounded-lg transition"
          title="Chỉnh sửa hồ sơ"
        >
          <Edit size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatsCard
          value={stats.totalCourses}
          label="Tổng số khóa học"
          color="purple"
        />
        <StatsCard value={stats.completed} label="Hoàn thành" color="emerald" />
        <StatsCard
          value={avgDisplay}
          label="Điểm trung bình"
          color="blue"
        />
      </div>
    </div>
  );
}
