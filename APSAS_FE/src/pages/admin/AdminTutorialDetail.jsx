import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ListChecks,
  User,
} from "lucide-react";
import adminContentService from "../../services/adminContentService";

export default function AdminTutorialDetail() {
  const { tutorialId } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        const result = await adminContentService.getTutorialById(tutorialId);
        
        const responseCode = (result.code || "").toUpperCase();
        if (responseCode === "OK" || responseCode === "200" || result.code === "ok") {
          setTutorial(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch tutorial");
        }
      } catch (error) {
        console.error("Error fetching tutorial:", error);
        alert("Không thể tải thông tin tutorial");
        navigate("/admin/resources");
      } finally {
        setLoading(false);
      }
    };

    if (tutorialId) {
      fetchTutorial();
    }
  }, [tutorialId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Không tìm thấy tutorial</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <button
              onClick={() => navigate("/admin/resources")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>

            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {tutorial.title || "Untitled"}
              </h1>
              <p className="text-gray-400">{tutorial.summary || tutorial.description || ""}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>Tạo: {formatDate(tutorial.createdAt)}</span>
                <span>•</span>
                <span>Cập nhật: {formatDate(tutorial.updatedAt)}</span>
              </div>
            </div>
          </div>
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
                  {tutorial.lessonCount || tutorial.contentCount || 0}
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
                  {tutorial.assignmentCount || 0}
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
                  {tutorial.status === "PUBLISHED" 
                    ? "Đã duyệt" 
                    : tutorial.status === "PENDING"
                    ? "Chờ duyệt"
                    : tutorial.status === "REJECTED"
                    ? "Đã từ chối"
                    : tutorial.status || "Nháp"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Danh sách nội dung
          </h2>

          {tutorial.items && tutorial.items.length > 0 ? (
            <div className="space-y-3">
              {tutorial.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-[#0f1419] border border-[#202934] rounded-lg hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        item.itemType === "CONTENT" || item.type === "content"
                          ? "bg-blue-500/10"
                          : "bg-purple-500/10"
                      }`}
                    >
                      {item.itemType === "CONTENT" || item.type === "content" ? (
                        <FileText size={18} className="text-blue-400" />
                      ) : (
                        <ListChecks size={18} className="text-purple-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        Order: {item.orderNo || item.order || "—"} •{" "}
                        {item.itemType === "CONTENT" || item.type === "content"
                          ? "Bài học"
                          : "Bài tập"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>Chưa có nội dung nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

