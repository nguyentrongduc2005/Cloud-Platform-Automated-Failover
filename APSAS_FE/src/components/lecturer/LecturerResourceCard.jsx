import {
  FileText,
  Dumbbell,
  Image,
  User,
  Calendar,
  Plus,
  Eye,
} from "lucide-react";

export default function LecturerResourceCard({
  resource,
  onApply,
  onViewDetail,
}) {
  return (
    <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-5 hover:border-emerald-500 transition-all group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition">
              {resource.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {resource.description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText size={16} className="text-blue-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Nội dung</div>
              <div className="text-white font-semibold">
                {resource.contentCount}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Dumbbell size={16} className="text-purple-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Bài tập</div>
              <div className="text-white font-semibold">
                {resource.exerciseCount}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Image size={16} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Hình ảnh</div>
              <div className="text-white font-semibold">
                {resource.imageCount}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#202934]">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User size={14} />
            <span>{resource.createdBy}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar size={14} />
            <span>{resource.createdAt}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onViewDetail(resource)}
            className="px-4 py-2.5 bg-[#0b0f12] border border-[#202934] text-gray-300 rounded-lg hover:border-emerald-500 hover:text-emerald-400 transition font-medium flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            <span>Chi tiết</span>
          </button>
          <button
            onClick={() => onApply(resource)}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>Áp dụng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
