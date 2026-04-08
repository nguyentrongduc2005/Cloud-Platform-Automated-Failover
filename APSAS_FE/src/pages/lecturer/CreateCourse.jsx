import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import lecturerService from "../../services/lecturerService";

export default function CreateCourse() {
  const navigate = useNavigate();
  const location = useLocation();
  const courseData = location.state;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    visibility: "PUBLIC", // PUBLIC, PRIVATE, UNLISTED
    type: "NORMAL",
    limit: ""
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("default");

  useEffect(() => {
    // Redirect if no course data from apply page
    if (!courseData) {
      navigate("/resources");
      return;
    }

    // Pre-fill form with tutorial title
    if (courseData.tutorialTitle) {
      setFormData(prev => ({
        ...prev,
        name: courseData.tutorialTitle,
        description: courseData.tutorialSummary || ""
      }));
    }
  }, [courseData, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate course name (required)
    if (!formData.name.trim()) {
      newErrors.name = "Tên khóa học là bắt buộc";
    } else if (formData.name.length > 160) {
      newErrors.name = "Tên khóa học không được vượt quá 160 ký tự";
    }

    // Validate course code (optional but must follow pattern)
    if (formData.code) {
      if (formData.code.length > 60) {
        newErrors.code = "Mã khóa học không được vượt quá 60 ký tự";
      } else if (!/^[A-Z0-9_-]*$/.test(formData.code)) {
        newErrors.code = "Mã khóa học chỉ được chứa chữ hoa (A-Z), số (0-9), gạch ngang (-) và gạch dưới (_)";
      }
    }

    // Validate student limit (optional but must be positive)
    if (formData.limit) {
      const limitNum = parseInt(formData.limit);
      if (isNaN(limitNum) || limitNum < 1) {
        newErrors.limit = "Giới hạn học viên phải là số dương";
      } else if (limitNum > 1000) {
        newErrors.limit = "Giới hạn học viên không được vượt quá 1000";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setAlertMessage(null);

    try {
      // Create course
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        code: formData.code.trim() || null,
        visibility: formData.visibility,
        type: formData.type.trim() || "NORMAL",
        avatarUrl: null,
        limit: formData.limit ? parseInt(formData.limit) : null,
        tutorialId: courseData.tutorialId,
        selectedContentIds: courseData.selectedContentIds,
        assignmentSchedules: courseData.assignmentSchedules
      };

      const response = await lecturerService.createCourse(requestData);

      if (response.code === "ok" || response.code === "200") {
        const courseId = response.data?.courseId; // Fix: use courseId instead of id
        
        // Show success and navigate to avatar upload
        setAlertMessage('Tạo khóa học thành công! Đang chuyển tới trang tải ảnh đại diện...');
        setAlertType('default');
        
        setTimeout(() => {
          navigate(`/courses/${courseId}/upload-avatar`, {
            state: { courseName: formData.name, courseId: courseId }
          });
        }, 1500);
      } else {
        throw new Error(response.message || "Tạo khóa học thất bại");
      }
    } catch (error) {
      setAlertMessage(error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại.");
      setAlertType('destructive');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if no course data
  if (!courseData) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Không tìm thấy dữ liệu khóa học</p>
          <button
            onClick={() => navigate("/resources")}
            className="px-4 py-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-600 transition"
          >
            Quay lại thư viện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#202934] rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Tạo khóa học mới</h1>
            <p className="text-gray-400">Hoàn thành thông tin khóa học từ tutorial</p>
          </div>
        </div>

        {/* Alert Message */}
        {alertMessage && (
          <Alert variant={alertType} className="bg-[#0b0f12] border-emerald-500 text-white">
            {alertType === 'destructive' ? (
              <AlertCircle className="h-4 w-4 text-red-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            <AlertDescription className={alertType === 'destructive' ? 'text-red-300' : 'text-emerald-300'}>
              {alertMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Course Info Summary */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <BookOpen size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Tutorial: {courseData.tutorialTitle}</h3>
              <p className="text-sm text-gray-400">
                {courseData.selectedContentIds.length} bài học • {courseData.assignmentSchedules.length} bài tập đã lên lịch
              </p>
            </div>
          </div>
        </div>

        {/* Course Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Thông tin khóa học</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên khóa học <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên khóa học..."
                  maxLength={160}
                  className={`w-full px-4 py-3 bg-[#0f1419] border rounded-lg text-white placeholder-gray-500 focus:outline-none transition ${
                    errors.name ? "border-red-500" : "border-[#202934] focus:border-emerald-500"
                  }`}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                <p className="text-gray-500 text-xs mt-1">
                  Tối đa 160 ký tự. Bắt buộc phải nhập.
                </p>
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mã khóa học
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                  placeholder="VD: JAVA-SPRING-2025"
                  maxLength={60}
                  className={`w-full px-4 py-3 bg-[#0f1419] border rounded-lg text-white placeholder-gray-500 focus:outline-none transition ${
                    errors.code ? "border-red-500" : "border-[#202934] focus:border-emerald-500"
                  }`}
                />
                {errors.code && <p className="text-red-400 text-sm mt-1">{errors.code}</p>}
                <p className="text-gray-500 text-xs mt-1">
                  Chỉ chữ HOA, số, gạch ngang (-), gạch dưới (_). Tối đa 60 ký tự.
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quyền truy cập
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange("visibility", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#202934] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="PUBLIC">PUBLIC - Công khai</option>
                  <option value="PRIVATE">PRIVATE - Riêng tư</option>
                  <option value="UNLISTED">UNLISTED - Không công khai</option>
                </select>
              </div>

              {/* Course Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Loại khóa học
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#202934] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="NORMAL">NORMAL - Khóa học thường</option>
                  <option value="PREMIUM">PREMIUM - Khóa học cao cấp</option>
                  <option value="FREE">FREE - Khóa học miễn phí</option>
                </select>
              </div>

              {/* Student Limit */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giới hạn học viên
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.limit}
                  onChange={(e) => handleInputChange("limit", e.target.value)}
                  placeholder="Để trống nếu không giới hạn"
                  className={`w-full px-4 py-3 bg-[#0f1419] border rounded-lg text-white placeholder-gray-500 focus:outline-none transition ${
                    errors.limit ? "border-red-500" : "border-[#202934] focus:border-emerald-500"
                  }`}
                />
                {errors.limit && <p className="text-red-400 text-sm mt-1">{errors.limit}</p>}
                <p className="text-gray-500 text-xs mt-1">
                  Từ 1 đến 1000 học viên. Để trống nếu không giới hạn.
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả khóa học
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Nhập mô tả chi tiết về khóa học..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#202934] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-lg transition"
              >
                <Save size={20} />
                {isSubmitting ? "Đang tạo khóa học..." : "Tạo khóa học"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}