import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Eye,
  Image as ImageIcon,
  Video,
  FileText,
} from "lucide-react";
import { getContentById } from "../../services/resourceService";

export default function ContentDetailView() {
  const { resourceId, contentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content"); // content, media

  // Determine back path based on current URL path
  const isViewMode = location.pathname.includes("/view/");
  const backPath = isViewMode
    ? `/provider/resources/${resourceId}/view`
    : `/provider/resources/${resourceId}`;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await getContentById(resourceId, contentId);
        console.log("📦 Content detail:", data);
        setContent(data);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [resourceId, contentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Không tìm thấy nội dung</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>

        {/* Title & Metadata */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-3">
            {content.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            {content.createdDate && (
              <>
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(content.createdDate).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-2">
              <FileText size={16} />
              Bài học
            </span>
            {content.totalMedia > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <ImageIcon size={16} />
                  {content.totalMedia} media
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl overflow-hidden">
          <div className="flex border-b border-[#202934]">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition relative ${
                activeTab === "content"
                  ? "text-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Eye size={18} />
              Nội dung
              {activeTab === "content" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("media")}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition relative ${
                activeTab === "media"
                  ? "text-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ImageIcon size={18} />
              Media
              {content.totalMedia > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                  {content.totalMedia}
                </span>
              )}
              {activeTab === "media" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
              )}
            </button>
          </div>

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="p-8">
              {content.bodyHtml ? (
                <div
                  className="prose prose-invert prose-emerald max-w-none
                    prose-headings:text-white 
                    prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-0
                    prose-h2:text-xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-6
                    prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
                    prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                    prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-white prose-strong:font-semibold
                    prose-em:text-gray-300 prose-em:italic
                    prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-[#0f1419] prose-pre:border prose-pre:border-[#202934] prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-4
                    prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-gray-300
                    prose-ul:text-gray-300 prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4
                    prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4
                    prose-li:mb-2 prose-li:text-gray-300
                    prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400 prose-blockquote:my-4
                    prose-table:w-full prose-table:border-collapse prose-table:my-4
                    prose-thead:border-b-2 prose-thead:border-[#202934]
                    prose-th:text-left prose-th:p-3 prose-th:text-white prose-th:font-semibold prose-th:bg-[#0f1419]
                    prose-td:p-3 prose-td:text-gray-300 prose-td:border-t prose-td:border-[#202934]
                    prose-tr:border-b prose-tr:border-[#202934]
                    prose-img:rounded-lg prose-img:my-4
                    prose-hr:border-[#202934] prose-hr:my-8
                  "
                  dangerouslySetInnerHTML={{ __html: content.bodyHtml }}
                />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Chưa có nội dung</p>
                </div>
              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="p-8">
              {content.mediaList && content.mediaList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.mediaList.map((media, index) => (
                    <div
                      key={media.id || index}
                      className="bg-[#0f1419] border border-[#202934] rounded-xl overflow-hidden hover:border-emerald-500/50 transition"
                    >
                      <div className="aspect-video bg-[#0b0f12] flex items-center justify-center overflow-hidden">
                        {media.type === "IMAGE" ||
                        media.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={media.url}
                            alt={media.caption || `Media ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<div class="text-gray-500 text-sm">Image not available</div>';
                            }}
                          />
                        ) : media.type === "VIDEO" ||
                          media.url?.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={media.url}
                            controls
                            className="w-full h-full"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <ImageIcon size={32} className="mb-2" />
                            <p className="text-sm">Media file</p>
                          </div>
                        )}
                      </div>
                      {media.caption && (
                        <div className="p-3 border-t border-[#202934]">
                          <p className="text-sm text-gray-300">
                            {media.caption}
                          </p>
                        </div>
                      )}
                      {media.type && (
                        <div className="px-3 pb-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                              media.type === "IMAGE"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-purple-500/10 text-purple-400"
                            }`}
                          >
                            {media.type === "IMAGE" ? (
                              <ImageIcon size={12} />
                            ) : (
                              <Video size={12} />
                            )}
                            {media.type}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Chưa có media nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
