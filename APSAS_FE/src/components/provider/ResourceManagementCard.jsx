import { FileText, Dumbbell, Image, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResourceManagementCard({ resource }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        text: "Chờ duyệt",
        bgColor: "bg-yellow-500/10",
        textColor: "text-yellow-400",
        borderColor: "border-yellow-500/20",
      },
      approved: {
        text: "Đã duyệt",
        bgColor: "bg-emerald-500/10",
        textColor: "text-emerald-400",
        borderColor: "border-emerald-500/20",
      },
      rejected: {
        text: "Từ chối",
        bgColor: "bg-red-500/10",
        textColor: "text-red-400",
        borderColor: "border-red-500/20",
      },
    };

    const config = statusConfig[resource.status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div
      onClick={() => navigate(`/provider/resources/${resource.id}`)}
      className="bg-[#0f1419] border border-[#202934] rounded-xl p-5 hover:border-emerald-500 transition-all group cursor-pointer"
    >
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

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {getStatusBadge(resource.status)}
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
            <Calendar size={14} />
            <span>{resource.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
