import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, Image, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import lecturerService from "../../services/lecturerService";

export default function UploadCourseAvatar() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const courseName = location.state?.courseName;

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("default");

  useEffect(() => {
    // Redirect if no courseId
    if (!courseId) {
      navigate("/lecturer/my-courses");
      return;
    }
  }, [courseId, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAlertMessage('Vui lòng chọn file hình ảnh (PNG, JPG, JPEG)');
        setAlertType('destructive');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlertMessage('Kích thước file không được vượt quá 5MB');
        setAlertType('destructive');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous alerts
      setAlertMessage(null);
    }
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleUpload = async () => {
    if (!avatarFile) {
      setAlertMessage('Vui lòng chọn ảnh trước khi tải lên');
      setAlertType('destructive');
      return;
    }

    setIsUploading(true);
    setAlertMessage(null);

    try {
      await lecturerService.uploadCourseAvatar(courseId, avatarFile);
      
      // Show success and navigate
      setAlertMessage('Tải ảnh đại diện thành công!');
      setAlertType('default');
      
      setTimeout(() => {
        navigate('/lecturer/my-courses');
      }, 1500);
    } catch (error) {
      setAlertMessage(error.response?.data?.message || error.message || "Có lỗi xảy ra khi tải ảnh. Vui lòng thử lại.");
      setAlertType('destructive');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    navigate('/lecturer/my-courses');
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/lecturer/my-courses')}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#202934] rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Tải ảnh đại diện</h1>
            <p className="text-gray-400">
              {courseName ? `Khóa học: ${courseName}` : `Course ID: ${courseId}`}
            </p>
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

        {/* Upload Form */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Ảnh đại diện khóa học</h3>
          
          <div className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-[#0f1419] border-2 border-dashed border-[#202934] rounded-xl flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <Image size={48} className="text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Chưa chọn ảnh</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <label className={`flex items-center gap-2 px-6 py-3 bg-[#0f1419] border border-[#202934] rounded-lg text-white transition ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500 cursor-pointer'
                }`}>
                  <Upload size={20} />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                
                {avatarFile && (
                  <button
                    type="button"
                    onClick={clearAvatar}
                    disabled={isUploading}
                    className="px-6 py-3 text-gray-400 hover:text-red-400 border border-[#202934] hover:border-red-500 rounded-lg transition disabled:opacity-50"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>

              {/* File Info */}
              {avatarFile && (
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Đã chọn: <span className="text-white">{avatarFile.name}</span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    Kích thước: {(avatarFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* Guidelines */}
              <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Yêu cầu ảnh:</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Định dạng: PNG, JPG, JPEG</li>
                  <li>• Kích thước tối đa: 5MB</li>
                  <li>• Khuyến nghị: Ảnh vuông, tỷ lệ 1:1</li>
                  <li>• Độ phân giải: Tối thiểu 400x400px</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isUploading}
              className="px-6 py-2.5 text-gray-400 hover:text-white border border-[#202934] hover:border-gray-500 rounded-lg transition disabled:opacity-50"
            >
              Bỏ qua
            </button>
            
            <button
              type="button"
              onClick={handleUpload}
              disabled={!avatarFile || isUploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-lg transition"
            >
              <Save size={20} />
              {isUploading ? "Đang tải lên..." : "Tải ảnh lên"}
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Bạn có thể cập nhật ảnh đại diện sau trong trang quản lý khóa học
          </p>
        </div>
      </div>
    </div>
  );
}