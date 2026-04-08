import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, FileText, Users, Layers, ChevronLeft, CheckCircle2, X } from "lucide-react";
import LecturerCard from "../components/lecturer/LecturerCard.jsx";
import OutcomeCard from "../components/student/OutcomeCard.jsx";
import courseService from "../services/courseService";
import { studentCourseService } from "../services/studentCourseService";
import { useAuth } from "../context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

const FALLBACK_BANNER =
  "https://huongnghiep.hocmai.vn/wp-content/uploads/2022/07/nganh-cong-nghe-thong-tin-hoc-truong-nao-1.jpg";

function StatPill({ icon: Icon, head, val }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg
                 border border-[#202934] bg-[#0f1419] px-3 py-2
                 transition hover:border-emerald-500/50"
    >
      <div className="text-emerald-400">
        <Icon size={18} />
      </div>
      <div className="leading-tight">
        <div className="text-xs text-gray-400">{head}</div>
        <div className="text-sm font-semibold text-white">{val}</div>
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Join course states
  const [isJoining, setIsJoining] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Gọi API lấy thông tin chi tiết cho trang regis
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await courseService.getCourseRegisterDetails(courseId);
        // BE trả { code, message, data }
        setCourse(res?.data || null);
      } catch (err) {
        console.error("Error fetching course detail:", err);
        setError("Không tải được thông tin khóa học.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Hàm đăng ký khóa học
  const handleRegister = async () => {
    if (!courseId) return;
    
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    setIsJoining(true);
    setJoinError("");

    try {
      const response = await studentCourseService.joinCourseById(Number(courseId));
      
      if (response.code === "ok" && response.data?.joined) {
        const joinedCourse = response.data.course;
        
        // Hiển thị success modal
        setSuccessData(joinedCourse);
        setShowSuccessModal(true);
      } else {
        setJoinError(response.message || "Không thể tham gia khóa học");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Không thể tham gia khóa học";
      setJoinError(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  // Loading / error states
  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
        <p className="text-gray-400">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
        <p className="text-red-400">
          {error || "Không tìm thấy thông tin khóa học."}
        </p>
      </div>
    );
  }

  const imageSrc = course.url || FALLBACK_BANNER;
  const categoryLabel = course.type || "Khóa học lập trình";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
      <div className="space-y-6">
        {/* Error Alert */}
        {joinError && (
          <Alert className="bg-red-950 border-red-800">
            <X className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">Lỗi tham gia khóa học</AlertTitle>
            <AlertDescription className="text-red-300">
              {joinError}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Modal */}
        {showSuccessModal && successData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <div
              className="bg-[#0f1419] border border-emerald-800 rounded-xl max-w-md w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-400">
                    Tham gia thành công!
                  </h3>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="p-1 hover:bg-[#202934] rounded-lg transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-white text-lg">
                  {successData.name}
                </h4>
                <p className="text-emerald-400 text-sm">
                  Giáo viên  {successData.lecture.name}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#202934]">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Số thành viên</p>
                    <p className="text-white font-semibold">{successData.currentMember}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Số bài học</p>
                    <p className="text-white font-semibold">{successData.totalLession}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition"
                >
                  Tuyệt vời!
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/student/my-courses');
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#0b0f12] border border-emerald-500 hover:bg-emerald-500/10 text-emerald-400 font-medium rounded-lg transition"
                >
                  Xem khóa học
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/courses")}
          className="inline-flex items-center gap-2 rounded-full
                      border border-[#202934] bg-[#0f1419] px-5 py-2 text-sm text-slate-200
                      hover:border-emerald-500 hover:text-emerald-400 transition cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Explore</span>
          <span className="opacity-50">/</span>
          <span className="text-emerald-400">{categoryLabel}</span>
        </button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Course Banner */}
          <section
            className="relative overflow-hidden rounded-xl
                     border border-[#202934] bg-[#0f1419] shadow-lg"
          >
            <div className="relative h-[500px] md:h-[600px]">
              <img
                src={imageSrc}
                alt={course.name}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/80" />

              <div className="relative h-full p-6 flex flex-col justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white leading-tight mb-2">
                    {course.name}
                  </h1>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {course.description || "Không có mô tả"}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <StatPill
                    icon={BookOpen}
                    head="Bài học"
                    val={`${course.lessonsCount ?? 0} bài học`}
                  />
                  <StatPill
                    icon={FileText}
                    head="Bài tập"
                    val={`${course.totalAssignments ?? 0} bài tập`}
                  />
                  <StatPill
                    icon={Layers}
                    head="Modules"
                    val={"Nhiều modules"}
                  />
                  <StatPill
                    icon={Users}
                    head="Thành viên"
                    val={`${course.totalStudents ?? 0} học viên`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Right Column - Sidebar Cards */}
          <aside className="flex flex-col gap-6">
            {/* Lecturer Card */}
            <div className="rounded-xl border border-[#202934] bg-[#0f1419] p-5">
              <h3 className="text-white font-bold text-lg mb-4">Giảng viên</h3>
              {course.instructor ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold text-lg">
                        {course.instructor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        {course.instructor.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {course.instructor.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2 text-sm">
                    <div>
                      <p className="text-gray-400">Khóa học</p>
                      <p className="text-white font-semibold">
                        {course.instructor.coursesCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Học viên</p>
                      <p className="text-white font-semibold">
                        {course.instructor.studentViews}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <LecturerCard />
              )}
            </div>

            {/* Description Card */}
            <div className="rounded-xl border border-[#202934] bg-[#0f1419] p-5">
              <h3 className="text-white font-bold text-lg mb-4">Mô tả</h3>
              <p className="text-gray-300 text-sm">
                {course.description || "Không có nội dung"}
              </p>
            </div>
          </aside>
        </div>

        {/* Error Alert */}
        {joinError && (
          <Alert className="bg-red-950 border-red-800">
            <X className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">Lỗi tham gia khóa học</AlertTitle>
            <AlertDescription className="text-red-300">
              {joinError}
            </AlertDescription>
          </Alert>
        )}

        {/* Register Button - Full Width Below */}
        <button
          onClick={handleRegister}
          disabled={loading || isJoining}
          className="w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-700 
                   text-white font-bold rounded-xl transition shadow-lg text-lg
                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          aria-label="Đăng ký khóa học"
        >
          {isJoining ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang tham gia...
            </>
          ) : (
            "Đăng ký khóa học"
          )}
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="bg-[#0f1419] border border-emerald-800 rounded-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-emerald-400">
                  Tham gia thành công!
                </h3>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="p-1 hover:bg-[#202934] rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-white text-lg">
                {successData.name}
              </h4>
              <p className="text-emerald-400 text-sm">
                👨‍🏫 {successData.lecture.name}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#202934]">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Số thành viên</p>
                  <p className="text-white font-semibold">{successData.currentMember}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Số bài học</p>
                  <p className="text-white font-semibold">{successData.totalLession}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition"
              >
                Tuyệt vời!
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/student/my-courses');
                }}
                className="flex-1 px-4 py-2.5 bg-[#0b0f12] border border-emerald-500 hover:bg-emerald-500/10 text-emerald-400 font-medium rounded-lg transition"
              >
                Xem khóa học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
