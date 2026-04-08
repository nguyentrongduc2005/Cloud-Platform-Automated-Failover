import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Eye, Image, FileText } from "lucide-react";
import studentCourseService from "../../services/studentCourseService";
import { marked } from "marked";

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function StudentContentDetail() {
  const { contentId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load content data from API
  useEffect(() => {
    const loadContentData = async () => {
      try {
        setLoading(true);
        const response = await studentCourseService.getContentDetail(contentId);
        
        if (response.code === "ok" || response.code === "0") {
          setContent(response.data);
        } else {
          throw new Error(response.message || "Failed to load content");
        }
      } catch (err) {
        console.error('Error loading content:', err);
        setError(err.message || "Có lỗi xảy ra khi tải nội dung");
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      loadContentData();
    }
  }, [contentId]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-8 bg-gray-700 rounded mb-4 w-2/3"></div>
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0f1419] border border-red-500/50 rounded-2xl p-6 text-center">
          <div className="text-red-400 text-lg mb-2">Có lỗi xảy ra</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No content data
  if (!content) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 text-center">
          <div className="text-gray-400">Không tìm thấy nội dung</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-sm text-emerald-400 font-medium">
            Nội dung bài học
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">{content.title}</h1>
          {content.summary && (
            <p className="text-gray-400 leading-relaxed">{content.summary}</p>
          )}

          {/* Content Statistics */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            {content.estimatedDuration && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{content.estimatedDuration} phút</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>Lượt xem: {content.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Image size={16} />
              <span>Hình ảnh: {content.totalImages || 0}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Body */}
      <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6">
        <div className="prose prose-invert max-w-none">
          {content.contentMd ? (
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: marked(content.contentMd),
              }}
            />
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">Nội dung đang được cập nhật</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}