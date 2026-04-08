import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Image as ImageIcon, Eye, X } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  createContent,
  updateContent,
  deleteContent,
  getContentById,
} from "../../services/resourceService";

export default function CreateContent() {
  const { resourceId, contentId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!contentId;

  const [activeTab, setActiveTab] = useState("editor"); // editor, images
  const [content, setContent] = useState({
    title: "",
    orderNo: 1,
    markdown: "",
  });
  const [images, setImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài học "${content.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteContent(resourceId, contentId);
      toast.success("Xóa bài học thành công!", {
        description: `Bài học "${content.title}" đã bị xóa`
      });
      navigate(`/provider/resources/${resourceId}`);
    } catch (error) {
      console.error("Error deleting content:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Có lỗi xảy ra khi xóa bài học";
      
      toast.error("Xóa bài học thất bại", {
        description: errorMessage
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      const fetchContent = async () => {
        try {
          setLoading(true);
          const data = await getContentById(resourceId, contentId);
          console.log("Loaded content data:", data);
          setContent({
            title: data.title,
            orderNo: data.orderNo,
            markdown: data.markdown || "",
          });
          setImages(data.images || []);
        } catch (error) {
          console.error("Error fetching content:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchContent();
    }
  }, [isEdit, resourceId, contentId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            url: reader.result,
            caption: "",
            file: file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updateImageCaption = (id, caption) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const handleSave = async () => {
    if (!content.title.trim() || !content.markdown.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSaving(true);
    try {
      // Tạo FormData để gửi cả text và images
      const formData = new FormData();
      formData.append('title', content.title);
      formData.append('bodyMd', content.markdown);
      formData.append('orderNo', parseInt(content.orderNo));

      // Thêm images vào FormData
      images.forEach((image, index) => {
        if (image.file) {
          // Nếu là file mới được upload
          formData.append('images', image.file);
        }
        // Thêm caption cho image
        if (image.caption) {
          formData.append(`imageCaptions[${index}]`, image.caption);
        }
      });

      if (isEdit) {
        await updateContent(resourceId, contentId, formData);
        toast.success("Cập nhật bài học thành công!", {
          description: `Bài học "${content.title}" đã được cập nhật`
        });
      } else {
        await createContent(resourceId, formData);
        toast.success("Tạo bài học thành công!", {
          description: `Bài học "${content.title}" đã được tạo với ${images.length} hình ảnh`
        });
      }
      navigate(`/provider/resources/${resourceId}`);
    } catch (error) {
      console.error("Error saving content:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Có lỗi xảy ra khi lưu bài học";
      
      toast.error(isEdit ? "Cập nhật bài học thất bại" : "Tạo bài học thất bại", {
        description: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0f1419] text-white"
      key={contentId || "new"}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/provider/resources/${resourceId}`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-white">
              {isEdit ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isEdit && (
              <button
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tiêu đề <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
                placeholder="Nhập tiêu đề bài học..."
                className="w-full bg-[#0f1419] border border-[#202934] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order No <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={content.orderNo}
                onChange={(e) =>
                  setContent({
                    ...content,
                    orderNo: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                className="w-full bg-[#0f1419] border border-[#202934] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#202934]">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition relative ${
                activeTab === "editor"
                  ? "text-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Eye size={18} />
              Markdown Editor
              {activeTab === "editor" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("images")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition relative ${
                activeTab === "images"
                  ? "text-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ImageIcon size={18} />
              Hình ảnh
              {images.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                  {images.length}
                </span>
              )}
              {activeTab === "images" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Editor Tab */}
        {activeTab === "editor" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Markdown Input */}
            <div className="bg-[#0b0f12] border border-[#202934] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#202934] bg-[#0f1419]">
                <h3 className="text-lg font-semibold text-white">Markdown</h3>
              </div>
              <textarea
                value={content.markdown}
                onChange={(e) =>
                  setContent({ ...content, markdown: e.target.value })
                }
                placeholder="# Tiêu đề&#10;&#10;Nhập nội dung markdown ở đây...&#10;&#10;## Tiêu đề phụ&#10;&#10;- Danh sách&#10;- Item 2&#10;&#10;**Bold text**&#10;*Italic text*&#10;&#10;```javascript&#10;code block&#10;```"
                className="w-full h-[600px] bg-[#0f1419] text-white p-6 focus:outline-none resize-none font-mono text-sm"
              />
            </div>

            {/* Preview */}
            <div className="bg-[#0b0f12] border border-[#202934] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#202934] bg-[#0f1419]">
                <h3 className="text-lg font-semibold text-white">Preview</h3>
              </div>
              <div className="p-6 h-[600px] overflow-y-auto">
                <div
                  className="prose prose-invert prose-emerald max-w-none
                    prose-headings:text-white 
                    prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-0
                    prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-8
                    prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-6
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
                >
                  <ReactMarkdown
                    key={content.markdown.length}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      code({ inline, className, children, ...props }) {
                        return inline ? (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {content.markdown || "*Nhập markdown để xem preview...*"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Hình ảnh</h3>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition cursor-pointer">
                <ImageIcon size={18} />
                Thêm hình ảnh
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="bg-[#0f1419] border border-[#202934] rounded-xl overflow-hidden"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={img.url}
                        alt={img.caption || "Uploaded"}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                    <div className="p-3">
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) =>
                          updateImageCaption(img.id, e.target.value)
                        }
                        placeholder="Thêm chú thích..."
                        className="w-full bg-[#0b0f12] border border-[#202934] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                <p>Chưa có hình ảnh nào</p>
                <p className="text-sm mt-1">Click "Thêm hình ảnh" để upload</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
