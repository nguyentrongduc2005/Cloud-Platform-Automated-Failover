import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import lecturerService from "../../services/lecturerService";
import SearchBar from "../../components/provider/SearchBar";
import LecturerResourceCard from "../../components/lecturer/LecturerResourceCard";
import Pagination from "../../components/provider/Pagination";

function TeacherTutorialLibrary() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  });

  const fetchResources = async (page = 1, searchKeyword = keyword) => {
    try {
      setLoading(true);
      const result = await lecturerService.getResources({
        page,
        limit: pagination.limit,
        keyword: searchKeyword,
      });

      setResources(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchResources(1, keyword);
  };

  const handlePageChange = (page) => {
    fetchResources(page, keyword);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApply = (resource) => {
    // Navigate to apply page to select content/assignments and set time
    navigate(`/resources/${resource.id}/apply`);
  };

  const handleViewDetail = (resource) => {
    // Navigate to resource detail page (read-only view)
    navigate(`/resources/${resource.id}/view`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Thư viện tài nguyên</h1>
        <p className="text-sm text-gray-400">
          Khám phá và áp dụng tài nguyên từ Provider vào khóa học của bạn
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearch={handleSearch}
      />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Đang tải...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && resources.length === 0 && (
        <div className="text-center py-12 bg-[#0f1419] border border-[#202934] rounded-xl">
          <p className="text-gray-400 text-lg">
            {keyword
              ? "Không tìm thấy tài nguyên nào phù hợp"
              : "Chưa có tài nguyên nào"}
          </p>
        </div>
      )}

      {/* Resources Grid */}
      {!loading && resources.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <LecturerResourceCard
                key={resource.id}
                resource={resource}
                onApply={handleApply}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* Summary */}
          <div className="text-center text-sm text-gray-400">
            Hiển thị {resources.length} trong tổng số {pagination.total} tài
            nguyên
          </div>
        </>
      )}
    </div>
  );
}

export default TeacherTutorialLibrary;
