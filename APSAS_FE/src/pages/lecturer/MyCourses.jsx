import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Users, Book, BarChart3, FileEdit, Search, ChevronLeft, ChevronRight } from "lucide-react";
import LecturerCourseCard from "../../components/lecturer/CourseCard";
import lecturerService from "../../services/lecturerService";

export default function LecturerMyCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // API state management
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    avgProgress: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 6,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true
  });

  // Load courses from API
  const loadCourses = async (page = 0, search = '') => {
    setLoading(true);
    try {
      const response = await lecturerService.getMyCourses({
        page,
        size: 6,
        search
      });
      
      if (response.code === "ok") {
        setCourses(response.data.content);
        setPagination({
          pageNumber: response.data.number,
          pageSize: response.data.size,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
          first: response.data.first,
          last: response.data.last
        });
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load stats from API
  const loadStats = async () => {
    try {
      const response = await lecturerService.getStats();
      
      if (response.code === "200") {
        setStats({
          totalCourses: response.data.totalCourses,
          totalStudents: response.data.totalStudents, 
          totalLessons: response.data.totalLessons,
          avgProgress: 85 // Mock value hoặc tính toán từ courses
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadCourses();
    loadStats();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadCourses(0, searchTerm);
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (!pagination.first) {
      loadCourses(pagination.pageNumber - 1, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (!pagination.last) {
      loadCourses(pagination.pageNumber + 1, searchTerm);
    }
  };

  const goToPage = (page) => {
    loadCourses(page, searchTerm);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Khóa học của tôi
          </h1>
          <p className="text-gray-400 mt-1">
            Quản lý và theo dõi khóa học, {user?.name}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/resources")}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition whitespace-nowrap"
          >
            + Tạo khóa học mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tổng khóa học</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.totalCourses}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <BookOpen size={24} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tổng học viên</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {stats.totalStudents}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tổng bài học</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {stats.totalLessons}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Book size={24} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tiến độ TB</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {stats.avgProgress}%
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 size={24} className="text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0f1419] border border-[#202934] rounded-lg p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f12] border border-[#202934] rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-[#0f1419] border border-[#202934] rounded-lg p-6 animate-pulse">
              <div className="bg-gray-700 h-40 rounded-lg mb-4"></div>
              <div className="bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-700 h-3 rounded mb-4 w-3/4"></div>
              <div className="flex gap-2">
                <div className="bg-gray-700 h-3 rounded w-1/4"></div>
                <div className="bg-gray-700 h-3 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Course Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <LecturerCourseCard 
              key={course.id} 
              course={{
                id: course.id,
                title: course.name,
                thumbnail: course.avatarUrl,
                language: course.visibility,
                studentCount: course.currentMember,
                lessonCount: course.totalLession,
                duration: course.totalLession * 2, // Estimate 2h per lesson
                progress: 100, // Mock - hoặc tính từ API khác
                type: course.type
              }} 
            />
          ))}
        </div>
      )}

      {/* Empty State (nếu không có khóa học) */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-12 bg-[#0f1419] border border-[#202934] rounded-lg">
          <div className="flex justify-center mb-4">
            <FileEdit size={64} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Chưa có khóa học
          </h3>
          <p className="text-gray-400 mb-6">
            Tạo khóa học đầu tiên và bắt đầu giảng dạy
          </p>
          <Link
            to="/lecturer/courses/create"
            className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition"
          >
            Tạo khóa học
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!loading && courses.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={handlePrevPage}
            disabled={pagination.first}
            className="p-2 rounded-lg border border-[#202934] text-gray-400 hover:text-white hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-1">
            {[...Array(pagination.totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  pagination.pageNumber === index
                    ? "bg-emerald-500 text-black"
                    : "text-gray-400 hover:text-white border border-[#202934] hover:border-emerald-500"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={pagination.last}
            className="p-2 rounded-lg border border-[#202934] text-gray-400 hover:text-white hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={20} />
          </button>
          
          <span className="text-sm text-gray-400 ml-4">
            Trang {pagination.pageNumber + 1} / {pagination.totalPages} 
            ({pagination.totalElements} khóa học)
          </span>
        </div>
      )}
    </div>
  );
}
