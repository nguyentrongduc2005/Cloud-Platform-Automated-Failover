import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Video,
  Play,
  X,
} from "lucide-react";
import  lecturerService  from "../services/lecturerService";

export default function ContentDetail() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("content"); // content, media
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await lecturerService.getContentDetail(contentId);
        setContent(response.data);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId]);

  const openMediaModal = (media) => {
    setSelectedMedia(media);
    setMediaModalOpen(true);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
    setMediaModalOpen(false);
  };

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
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {content.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Nội dung {content.id}</span>
              <span>•</span>
              <span>Tạo: {new Date(content.createdDate).toLocaleDateString('vi-VN')}</span>
              {content.lastUpdateDate && (
                <>
                  <span>•</span>
                  <span>Cập nhật: {new Date(content.lastUpdateDate).toLocaleDateString('vi-VN')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#202934]">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition relative ${
                activeTab === "content"
                  ? "text-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText size={18} />
              Nội dung
              {activeTab === "content" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("media")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition relative ${
                activeTab === "media"
                  ? "text-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ImageIcon size={18} />
              Media Files
              {content.mediaList?.length > 0 ? (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                  {content.mediaList.length}
                </span>
              ) : null}
              {activeTab === "media" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-8">
            <div
              className="prose prose-invert prose-emerald max-w-none
                prose-headings:text-white 
                prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-8
                prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-6
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-semibold
                prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-[#0f1419] prose-pre:border prose-pre:border-[#202934] prose-pre:rounded-lg
                prose-ul:text-gray-300 prose-ul:list-disc prose-ul:ml-6
                prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:ml-6
                prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
                prose-img:rounded-lg prose-img:shadow-lg
                prose-table:border-collapse prose-table:w-full
                prose-th:bg-[#0f1419] prose-th:border prose-th:border-[#202934] prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                prose-td:border prose-td:border-[#202934] prose-td:px-4 prose-td:py-2
              "
              dangerouslySetInnerHTML={{ __html: content.bodyHtml }}
            />
          </div>
        )}

        {/* Media Tab */}
        {activeTab === "media" && (
          <div className="space-y-8">
            {content.mediaList && content.mediaList.length > 0 ? (
              <>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ImageIcon size={20} className="text-blue-400" />
                  Media Files ({content.mediaList.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {content.mediaList.map((media, index) => {
                    const isVideo = media.type?.includes('video') || media.url?.includes('.mp4') || media.url?.includes('.webm');
                    
                    return (
                      <div
                        key={index}
                        onClick={() => openMediaModal({ type: isVideo ? "video" : "image", url: media.url, caption: media.name })}
                        className="group relative bg-[#0b0f12] border border-[#202934] rounded-xl overflow-hidden cursor-pointer hover:border-blue-500/50 transition aspect-square"
                      >
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/30">
                            <Video size={48} className="text-gray-600" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition">
                              <div className="w-12 h-12 rounded-full bg-purple-500/90 group-hover:bg-purple-500 flex items-center justify-center transition">
                                <Play size={20} className="text-white ml-1" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt={media.name || `Media ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        
                        {media.name && (
                          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3">
                            <p className="text-sm text-white truncate">
                              {media.name}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-12 text-center">
                <ImageIcon size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">
                  Chưa có media files nào
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Modal */}
      {mediaModalOpen && selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeMediaModal}
        >
          <button
            onClick={closeMediaModal}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition z-10"
          >
            <X size={20} className="text-white" />
          </button>

          <div
            className="max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === "video" ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                {selectedMedia.caption && (
                  <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white">
                      {selectedMedia.caption}
                    </h3>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black rounded-lg overflow-hidden">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.caption || "Image"}
                    className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                  />
                </div>
                {selectedMedia.caption && (
                  <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-4">
                    <p className="text-white">{selectedMedia.caption}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
