// src/pages/admin/ContentApprovals.jsx
import { useState, useEffect } from "react";
import adminContentService from "../../services/adminContentService";
import ContentToolbar from "../../components/admin/ContentToolbar";
import ContentTable from "../../components/admin/ContentTable";
import ContentViewModal from "../../components/admin/ContentViewModal";

export default function ContentApprovals() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("pending");
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, data: null });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Fetch contents with pagination
  const fetchContents = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminContentService.getContents({
        keyword: q,
        type,
        status,
        page,
        size: 10,
      });
      
      // Handle both array response and paginated response
      const responseCode = (result.code || "").toUpperCase();
      if (responseCode === "OK" || responseCode === "200") {
        let contentList = [];
        
        // Check if data is paginated (has content property) or array
        if (result.data?.content) {
          contentList = result.data.content;
          setPagination({
            page: result.data.pageable?.pageNumber || page,
            size: result.data.pageable?.pageSize || 10,
            totalElements: result.data.totalElements || 0,
            totalPages: result.data.totalPages || 0,
          });
        } else if (Array.isArray(result.data)) {
          contentList = result.data;
          setPagination({
            page: 0,
            size: contentList.length,
            totalElements: contentList.length,
            totalPages: 1,
          });
        }
        
        // Map API response to expected format
        const mappedContents = contentList.map(tutorial => ({
          id: tutorial.id,
          title: tutorial.title || "Untitled",
          type: tutorial.type || "UNKNOWN",
          author: tutorial.author?.fullname || tutorial.author?.username || "Unknown",
          submittedAt: tutorial.createdAt ? new Date(tutorial.createdAt).toLocaleDateString('vi-VN') : "N/A",
          status: tutorial.status?.toLowerCase() || "pending",
          note: tutorial.note || "",
        }));
        setContents(mappedContents);
      } else {
        setContents([]);
      }
    } catch (error) {
      console.error("Error fetching contents:", error);
      setError(error.message || "Không thể tải danh sách nội dung");
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // Only refetch when status changes

  // Manual search trigger
  const handleSearch = () => {
    fetchContents(0);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchContents(newPage);
  };

  const openView = (row) => setModal({ open: true, data: row });
  const closeView = () => setModal({ open: false, data: null });

  const decide = async (decision, note) => {
    try {
      // Validate tutorial status before review
      if (modal.data && modal.data.status) {
        const currentStatus = (modal.data.status || "").toUpperCase();
        if (currentStatus !== "PENDING" && currentStatus !== "pending") {
          alert(`Không thể review tutorial này. Trạng thái hiện tại: ${modal.data.status}. Chỉ có thể review tutorial ở trạng thái PENDING.`);
          return;
        }
      }

      if (decision === "approved") {
        const result = await adminContentService.approveContent(modal.data.id, note);
        // Check response code (handle both "ok" and "OK")
        const responseCode = (result.code || "").toUpperCase();
        if (responseCode === "OK" || responseCode === "200") {
          alert("Nội dung đã được duyệt thành công!");
          // Refresh the list with current pagination
          fetchContents(pagination.page);
          closeView();
        } else {
          throw new Error(result.message || "Duyệt nội dung thất bại");
        }
      } else if (decision === "rejected") {
        // Optional: Validate note for rejection (can be made required)
        // if (!note || !note.trim()) {
        //   alert("Vui lòng nhập lý do từ chối.");
        //   return;
        // }

        const result = await adminContentService.rejectContent(modal.data.id, note);
        // Check response code (handle both "ok" and "OK")
        const responseCode = (result.code || "").toUpperCase();
        if (responseCode === "OK" || responseCode === "200") {
          alert("Nội dung đã bị từ chối!");
          // Refresh the list with current pagination
          fetchContents(pagination.page);
          closeView();
        } else {
          throw new Error(result.message || "Từ chối nội dung thất bại");
        }
      }
    } catch (error) {
      console.error("Error deciding content:", error);
      // Show user-friendly error message
      const errorMessage = error.message || "Thao tác thất bại. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-semibold text-slate-100 mb-4">
        Xác nhận nội dung
      </h1>

      <div className="rounded-xl border border-[#1e2630] bg-[#0b0f14] p-4">
        <div className="flex items-center gap-2">
          <ContentToolbar
            q={q}
            setQ={setQ}
            type={type}
            setType={setType}
            status={status}
            setStatus={setStatus}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tìm kiếm
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Đang tải...</p>
          </div>
        ) : (
          <>
            <ContentTable contents={contents} onView={openView} />
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#202934]">
                <div className="text-sm text-gray-400">
                  Hiển thị {contents.length} trong tổng số {pagination.totalElements} nội dung
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className="px-3 py-1.5 bg-[#0b0f12] border border-[#202934] rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#202934] transition"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-gray-400">
                    Trang {pagination.page + 1} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages - 1}
                    className="px-3 py-1.5 bg-[#0b0f12] border border-[#202934] rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#202934] transition"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ContentViewModal
        open={modal.open}
        onClose={closeView}
        data={modal.data}
        onDecision={decide}
      />
    </div>
  );
}
