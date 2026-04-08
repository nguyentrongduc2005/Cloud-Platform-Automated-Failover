import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CourseCard from "../components/common/CourseCard";
import courseService from "../services/courseService";

export default function PublicCourses() {
  const navigate = useNavigate();

  // state cho list khóa public lấy từ API
  const [publicCourses, setPublicCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // số khóa học mỗi trang
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // state cho ô search
  const [searchText, setSearchText] = useState("");

  // gọi API mỗi khi đổi trang hoặc đổi search
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await courseService.getPublicCourses({
          page: currentPage - 1, // FE (1-based) -> BE (0-based)
          size: itemsPerPage,
          search: searchText.trim(),
        });

        // BE trả về { code, message, data: pageObject }
        const data = res?.data || res;

        setPublicCourses(data?.content || []);
        setTotalPages(data?.totalPages || 1);
      } catch (error) {
        console.error("Failed to load public courses", error);
        setPublicCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, searchText]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Khóa học công khai
          </h1>
          <p className="text-gray-400">
            Khám phá các khóa học lập trình trên nền tảng APSAS
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchText(e.target.value);
            }}
            placeholder="Tìm kiếm khóa học..."
            className="w-full sm:w-96 px-4 py-3 rounded-lg bg-[#0b0f12] border border-[#202934] text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400 text-lg">Đang tải khóa học...</div>
          </div>
        ) : publicCourses.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center space-y-2">
              <p className="text-gray-400 text-lg">
                Không tìm thấy khóa học nào
              </p>
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="text-emerald-400 hover:underline text-sm"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
                className="cursor-pointer"
              >
                <CourseCard
                  id={course.id}
                  title={course.name}
                  desc={
                    course.description ||
                    "Khóa học lập trình trên nền tảng APSAS."
                  }
                  image={
                    course.url ||
                    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop"
                  }
                  stats={{
                    learners: course.studentsCount ?? 0,
                    progress:
                      course.lessonsCount && course.lessonsCountTotal
                        ? `${course.lessonsCount}/${course.lessonsCountTotal}`
                        : "",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border transition ${
              currentPage === 1
                ? "border-[#202934] text-gray-600 cursor-not-allowed"
                : "border-[#202934] text-white hover:border-emerald-500 hover:text-emerald-400"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`min-w-10 h-10 rounded-lg border transition font-medium ${
                  currentPage === page
                    ? "bg-emerald-500 border-emerald-500 text-black"
                    : "border-[#202934] text-white hover:border-emerald-500 hover:text-emerald-400"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border transition ${
              currentPage === totalPages
                ? "border-[#202934] text-gray-600 cursor-not-allowed"
                : "border-[#202934] text-white hover:border-emerald-500 hover:text-emerald-400"
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
