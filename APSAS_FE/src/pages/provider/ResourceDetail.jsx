import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  FileText,
  ListChecks,
  Calendar,
  User,
  Edit,
} from "lucide-react";
import { getResourceDetail } from "../../services/resourceService";

export default function ResourceDetail() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const data = await getResourceDetail(resourceId);
        setResource(data);
      } catch (error) {
        console.error("Error fetching resource:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Không tìm thấy tài nguyên</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <button
              onClick={() => navigate("/provider/resources")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>

            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {resource.title}
              </h1>
              <p className="text-gray-400">{resource.summary}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {resource.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Tạo: {resource.createdAt}
                </span>
                <span>•</span>
                <span>Cập nhật: {resource.updatedAt}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/provider/resources/${resourceId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#202934] text-gray-300 hover:text-white hover:border-emerald-500/50 transition"
          >
            <Edit size={18} />
            Chỉnh sửa
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Bài học</p>
                <p className="text-xl font-bold text-white">
                  {resource.items?.filter((item) => item.itemType === "CONTENT")
                    .length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ListChecks size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Bài tập</p>
                <p className="text-xl font-bold text-white">
                  {resource.items?.filter(
                    (item) => item.itemType === "ASSIGNMENT"
                  ).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <User size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Trạng thái</p>
                <p className="text-sm font-bold text-white">
                  {resource.status === "published" ? "Đã xuất bản" : "Nháp"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Thêm nội dung
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() =>
                navigate(`/provider/resources/${resourceId}/create-content`)
              }
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition"
            >
              <FileText size={20} />
              Tạo bài học
            </button>
            <button
              onClick={() =>
                navigate(`/provider/resources/${resourceId}/create-assignment`)
              }
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition"
            >
              <ListChecks size={20} />
              Tạo bài tập
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Danh sách nội dung
          </h2>

          {resource.items && resource.items.length > 0 ? (
            <div className="space-y-3">
              {resource.items.map((item) => {
                const isContent = item.itemType === "CONTENT";
                return (
                  <div
                    key={`${item.itemType}-${item.id}`}
                    className="flex items-center justify-between p-4 bg-[#0f1419] border border-[#202934] rounded-lg hover:border-emerald-500/30 transition"
                  >
                    <div
                      onClick={() => {
                        if (isContent) {
                          navigate(
                            `/provider/resources/${resourceId}/content/${item.id}`
                          );
                        } else {
                          navigate(
                            `/provider/resources/${resourceId}/assignment/${item.id}`
                          );
                        }
                      }}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isContent ? "bg-blue-500/10" : "bg-purple-500/10"
                        }`}
                      >
                        {isContent ? (
                          <FileText size={18} className="text-blue-400" />
                        ) : (
                          <ListChecks size={18} className="text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          Order: {item.orderNo} •{" "}
                          {isContent ? "Bài học" : "Bài tập"}
                          {!isContent &&
                            item.maxScore &&
                            ` • ${item.maxScore} điểm`}
                          {!isContent &&
                            item.skillName &&
                            ` • ${item.skillName}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isContent) {
                          navigate(
                            `/provider/resources/${resourceId}/content/${item.id}/edit`
                          );
                        } else {
                          navigate(
                            `/provider/resources/${resourceId}/assignment/${item.id}/edit`
                          );
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#202934] text-gray-400 hover:text-white hover:border-emerald-500/50 transition text-sm"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>Chưa có nội dung nào</p>
              <p className="text-sm mt-1">
                Bắt đầu bằng cách tạo bài học hoặc bài tập
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
