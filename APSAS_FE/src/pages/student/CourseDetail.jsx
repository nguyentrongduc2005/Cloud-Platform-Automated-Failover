import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Book,
  BarChart3,
  FileText,
  CalendarDays,
  Calendar,
  Clock,
  Play,
  ListChecks,
  ChevronsRight,
  PenSquare,
  Image,
  HelpCircle,
  X,
} from "lucide-react";
import studentCourseService from "../../services/studentCourseService";
import courseService from "../../services/courseService";
import { toast } from "sonner";

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "assignments" ? "assignments" : "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTitle, setHelpTitle] = useState("");
  const [helpContent, setHelpContent] = useState("");
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
  
  // API state
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reset state when courseId changes
  useEffect(() => {
    setCourse(null);
    setModules([]);
    setAssignments([]);
    setError(null);
  }, [courseId]);

  // Load course data from API
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const response = await studentCourseService.getCourseDetail(courseId);
        
        console.log('Course detail response:', response); // Debug log
        
        if (response && response.code === "ok") {
          const data = response.data;
          
          // Set course info
          setCourse({
            id: courseId,
            title: data.name,
            description: data.description || "Chưa có mô tả",
            totalLessons: data.totalLession || 0,
            totalAssignments: data.totalAssignment || 0, 
            totalStudents: data.currentMember || 0,
            avgProgress: data.progressAverage || 0,
            lecturer: data.lecture,
            avatarUrl: data.avatarUrl,
            type: data.type,
          });

          // Transform and combine content and assignments into modules
          const contentModules = data.contentItems?.map(item => ({
            id: item.id,
            title: item.title,
            orderNo: item.orderNo || 0,
            totalMedia: item.totalMedia || 0,
            duration: "45 phút", // Default duration
            imageCount: item.totalMedia || 0,
            type: "content",
            status: "available", // TODO: Get from progress API
          })) || [];

          const assignmentModules = data.assignments?.map(item => ({
            id: item.id, 
            title: item.title,
            orderNo: item.orderNo || 99,
            openAt: item.openAt,
            dueAt: item.dueAt,
            deadline: item.dueAt ? new Date(item.dueAt).toLocaleDateString('vi-VN') : "Chưa có hạn",
            type: "assignment",
            status: "available", // TODO: Get from submission API
          })) || [];

          // Set assignments for assignments tab (with proper fallback)
          setAssignments(data.assignments || []);

          // Combine and sort by orderNo
          const allModules = [...contentModules, ...assignmentModules]
            .sort((a, b) => a.orderNo - b.orderNo);
          
          setModules(allModules);
        } else {
          throw new Error(response.message || "Failed to load course data");
        }
      } catch (err) {
        console.error('Error loading course data:', err);
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu khóa học");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "assignments" ? { tab } : {});
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-8 bg-gray-700 rounded mb-4 w-2/3"></div>
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
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

  // No course data
  if (!course) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 text-center">
          <div className="text-gray-400">Không tìm thấy dữ liệu khóa học</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/student/my-courses")}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={18} />
              Khóa học của tôi
            </button>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-emerald-400 font-medium">
              Chi tiết
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-400 font-semibold">
              Tiến độ trung bình: {course.avgProgress}%
            </span>
            <button
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium transition border border-amber-500/20"
            >
              <HelpCircle size={18} />
              Yêu cầu hỗ trợ
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <p className="text-sm text-emerald-400 font-medium">Khóa học</p>
            <h1 className="text-3xl font-bold text-white">{course.title}</h1>
            {course.description && (
              <p className="text-gray-400 leading-relaxed">
                {course.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              {course.lecturer?.avatarUrl && (
                <img 
                  key={`lecturer-avatar-${courseId}-${course.lecturer.avatarUrl}`}
                  src={course.lecturer.avatarUrl} 
                  alt={course.lecturer.name}
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              )}
              <p className="text-gray-400">
                Giảng viên: {course.lecturer?.name || "Chưa có thông tin"}
              </p>
            </div>
            {course.type && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                {course.type}
              </span>
            )}
          </div>
          <div className="relative aspect-video lg:aspect-square rounded-xl overflow-hidden bg-[#0b0f12]">
            <img
              key={`course-avatar-${courseId}-${course.avatarUrl}`}
              src={course.avatarUrl || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=450&fit=crop"}
              alt={course.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Học viên</p>
              <p className="text-xl font-semibold text-white">
                {course.totalStudents}
              </p>
            </div>
          </div>
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Book size={22} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bài học</p>
              <p className="text-xl font-semibold text-white">
                {course.totalLessons}
              </p>
            </div>
          </div>
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <FileText size={22} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bài tập</p>
              <p className="text-xl font-semibold text-white">
                {course.totalAssignments}
              </p>
            </div>
          </div>
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BarChart3 size={22} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Tiến độ TB</p>
              <p className="text-xl font-semibold text-white">
                {course.avgProgress}%
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleTabChange("overview")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "overview"
                ? "bg-white/5 border border-white/10 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => handleTabChange("assignments")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "assignments"
                ? "bg-white/5 border border-white/10 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Bài tập
          </button>
        </div>
      </section>

      {activeTab === "overview" ? (
        <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Nội dung khóa học
            </h2>
            <span className="text-sm text-gray-400">{modules.length} mục</span>
          </div>
          <div className="space-y-3">
            {modules.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === "assignment") {
                    navigate(`/student/courses/${courseId}/assignments/${item.id}`);
                  } else if (item.type === "content") {
                    navigate(`/student/courses/${courseId}/content/${item.id}`);
                  }
                }}
                className={`rounded-xl border border-[#202934] bg-[#0b0f12] p-4 hover:border-emerald-500/40 transition cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        item.type === "content"
                          ? "bg-blue-500/10"
                          : "bg-purple-500/10"
                      }`}
                    >
                      {item.type === "content" ? (
                        <Play size={18} className="text-blue-400" />
                      ) : (
                        <ListChecks size={18} className="text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{item.title}</p>
                      </div>
                      {item.type === "content" && (
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {item.duration}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Image size={12} />
                            {item.imageCount} ảnh
                          </span>
                        </div>
                      )}
                      {item.type === "assignment" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Hạn nộp: {item.deadline}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-medium">
                    {item.status === "completed" && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                        Hoàn thành
                      </span>
                    )}
                    {item.status === "review" && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400">
                        Chờ đánh giá
                      </span>
                    )}
                    {item.status === "in-progress" && (
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400">
                        Đang học
                      </span>
                    )}
                    {item.status === "not-started" && (
                      <span className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-400">
                        Chưa bắt đầu
                      </span>
                    )}
                    {item.status === "locked" && (
                      <span className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-500">
                        Chưa mở
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Danh sách bài tập
              </h2>
              <p className="text-sm text-gray-400">
                Theo dõi trạng thái và truy cập nhanh từng bài.
              </p>
            </div>
            <span className="text-sm text-gray-400">
              Tổng {assignments.length} bài tập
            </span>
          </div>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-[#202934] bg-[#0b0f12] p-5 space-y-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Bài tập</p>
                    <h3 className="text-lg font-semibold text-white">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CalendarDays size={16} />
                      Deadline: {assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString('vi-VN') : "Chưa có hạn"}
                    </div>
                    {assignment.openAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock size={16} />
                        Mở: {new Date(assignment.openAt).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      assignment.dueAt && new Date(assignment.dueAt) < new Date()
                        ? "text-red-400 bg-red-500/10"
                        : assignment.openAt && new Date(assignment.openAt) <= new Date()
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-yellow-400 bg-yellow-500/10"
                    }`}
                  >
                    {assignment.dueAt && new Date(assignment.dueAt) < new Date()
                      ? "Hết hạn"
                      : assignment.openAt && new Date(assignment.openAt) <= new Date()
                      ? "Đang mở"
                      : "Chưa mở"}
                  </span>
                </div>
                
                {assignment.maxScore && (
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Điểm tối đa: {assignment.maxScore}</span>
                    {assignment.attemptsLimit && (
                      <span>Số lần làm: {assignment.attemptsLimit}</span>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        navigate(`/student/courses/${courseId}/assignments/${assignment.id}`, {
                          state: {
                            from: `/student/my-courses/${courseId}?tab=assignments`,
                          },
                        })
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-black hover:bg-blue-400 transition"
                    >
                      Xem bài tập
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Help Request Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowHelpModal(false)}
          ></div>
          <div className="relative bg-[#0f1419] border border-[#202934] rounded-2xl w-full max-w-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Yêu cầu hỗ trợ</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Khóa học
                </label>
                <input
                  type="text"
                  value={course.title}
                  disabled
                  className="w-full bg-[#0b0f12] border border-[#202934] rounded-lg px-4 py-2.5 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiêu đề <span className="text-gray-500">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={helpTitle}
                  onChange={(e) => setHelpTitle(e.target.value)}
                  placeholder="Ví dụ: Cần giúp đỡ về bài tập Java"
                  className="w-full bg-[#0b0f12] border border-[#202934] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 mb-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nội dung yêu cầu <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={helpContent}
                  onChange={(e) => setHelpContent(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                  rows={6}
                  className="w-full bg-[#0b0f12] border border-[#202934] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Vui lòng mô tả rõ ràng để giảng viên có thể hỗ trợ tốt nhất
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowHelpModal(false);
                  setHelpTitle("");
                  setHelpContent("");
                }}
                className="px-5 py-2.5 rounded-lg border border-[#202934] text-gray-300 hover:text-white hover:border-gray-600 transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!helpContent.trim()) {
                    toast.error("Vui lòng nhập nội dung yêu cầu");
                    return;
                  }

                  setIsSubmittingHelp(true);
                  try {
                    // Call API to submit help request
                    // API: POST /api/help-requests/course/{courseId}
                    // Request body: { title, body }
                    const requestData = {
                      title: helpTitle.trim() || `Yêu cầu hỗ trợ - ${course.title}`,
                      body: helpContent.trim()
                    };

                    const response = await courseService.submitHelpRequest(courseId, requestData);
                    
                    if (response.success) {
                      toast.success(response.message || "Yêu cầu hỗ trợ đã được gửi thành công!");
                      setShowHelpModal(false);
                      setHelpTitle("");
                      setHelpContent("");
                    } else {
                      toast.error(response.message || "Có lỗi xảy ra. Vui lòng thử lại!");
                    }
                  } catch (err) {
                    console.error('Help request error:', err);
                    const errorMessage = err.message || "Có lỗi xảy ra. Vui lòng thử lại!";
                    toast.error(errorMessage);
                  } finally {
                    setIsSubmittingHelp(false);
                  }
                }}
                disabled={isSubmittingHelp || !helpContent.trim()}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingHelp ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
