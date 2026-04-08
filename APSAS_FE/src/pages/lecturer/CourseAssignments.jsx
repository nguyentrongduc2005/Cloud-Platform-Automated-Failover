import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Book,
  BarChart3,
  CalendarDays,
  PenSquare,
  ChevronsRight,
  X,
  Plus,
  FileText,
} from "lucide-react";
import  lecturerService  from "../../services/lecturerService";
import { useToast } from '../../hooks/useToast';

const statusBadge = {
  completed: "text-emerald-400 bg-emerald-500/10",
  "in-progress": "text-amber-400 bg-amber-500/10",
  "not-started": "text-gray-400 bg-white/5",
};

export default function CourseAssignments() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // State for course and assignments data
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load course and assignments data
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        
        // Load course overview and assignments in parallel
        const [courseResponse, assignmentsResponse] = await Promise.all([
          lecturerService.getCourseOverview(courseId),
          lecturerService.getCourseAssignments(courseId)
        ]);
        
        // Set course data
        if (courseResponse.code === "ok" || courseResponse.code === "0") {
          setCourse(courseResponse.data);
        } else {
          throw new Error(courseResponse.message || "Failed to load course data");
        }
        
        // Set assignments data
        if (assignmentsResponse.code === "ok" || assignmentsResponse.code === "0") {
          // Transform API data to match UI expectations
          const transformedAssignments = assignmentsResponse.data.map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            deadline: assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString('vi-VN') : "Chưa có hạn",
            dueAt: assignment.dueAt,
            openAt: assignment.openAt,
            status: "in-progress", // Default status, can be enhanced based on API
            statusLabel: "Đang diễn ra",
            submitted: 0, // Will need additional API call for submission stats
            total: courseResponse.data?.totalStudents || 0,
            progress: 0, // Will be calculated from submissions
            avgScore: null, // Will need additional API call for scores
          }));
          setAssignments(transformedAssignments);
        } else {
          setAssignments([]); // Set empty array if no assignments
        }
      } catch (err) {
        console.error('Error loading course assignments:', err);
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourseData();
    } else {
      setError("Không tìm thấy ID khóa học");
      setLoading(false);
    }
  }, [courseId]);

  const [deadlineModal, setDeadlineModal] = useState({
    open: false,
    assignment: null,
    openDate: "",
    openTime: "00:00",
    dueDate: "",
    dueTime: "23:59",
    saving: false,
  });

  const openDeadlineModal = (assignment) => {
    // Extract current openAt and dueAt from assignment
    const openDate = assignment.openAt ? assignment.openAt.split('T')[0] : '';
    const openTime = assignment.openAt ? assignment.openAt.split('T')[1]?.substring(0, 5) || '00:00' : '00:00';
    const dueDate = assignment.dueAt ? assignment.dueAt.split('T')[0] : '';
    const dueTime = assignment.dueAt ? assignment.dueAt.split('T')[1]?.substring(0, 5) || '23:59' : '23:59';
    
    setDeadlineModal({
      open: true,
      assignment,
      openDate,
      openTime,
      dueDate,
      dueTime,
      saving: false,
    });
  };

  const closeDeadlineModal = () =>
    setDeadlineModal({ 
      open: false, 
      assignment: null, 
      openDate: "", 
      openTime: "00:00",
      dueDate: "", 
      dueTime: "23:59",
      saving: false,
    });

  const handleSaveDeadline = async () => {
    try {
      setDeadlineModal(prev => ({ ...prev, saving: true }));
      
      const timeData = {};
      
      // Validation: Check if at least one time is provided
      if (!deadlineModal.openDate && !deadlineModal.dueDate) {
        showToast('Vui lòng nhập ít nhất một thời gian (mở hoặc hết hạn)', 'warning');
        return;
      }
      
      // Format openAt if provided
      if (deadlineModal.openDate && deadlineModal.openTime) {
        timeData.openAt = `${deadlineModal.openDate} ${deadlineModal.openTime}:00`;
      }
      
      // Format dueAt if provided  
      if (deadlineModal.dueDate && deadlineModal.dueTime) {
        timeData.dueAt = `${deadlineModal.dueDate} ${deadlineModal.dueTime}:00`;
      }
      
      // Validation: If both dates are provided, check that openAt is before dueAt
      if (timeData.openAt && timeData.dueAt) {
        const openTime = new Date(timeData.openAt);
        const dueTime = new Date(timeData.dueAt);
        
        if (openTime >= dueTime) {
          showToast('Thời gian mở phải trước thời gian hết hạn', 'error');
          return;
        }
      }
      
      // Validation: Check if dueAt is in the future
      if (timeData.dueAt) {
        const dueTime = new Date(timeData.dueAt);
        const now = new Date();
        
        if (dueTime <= now) {
          showToast('Thời gian hết hạn phải ở tương lai', 'error');
          return;
        }
      }
      
      const response = await lecturerService.setAssignmentTime(
        deadlineModal.assignment.id, 
        courseId, 
        timeData
      );
      
      if (response.code === "ok" || response.code === "0") {
        // Update the assignment in the list
        setAssignments(prev => prev.map(assignment => {
          if (assignment.id === deadlineModal.assignment.id) {
            return {
              ...assignment,
              dueAt: timeData.dueAt || assignment.dueAt,
              openAt: timeData.openAt || assignment.openAt,
              deadline: timeData.dueAt ? new Date(timeData.dueAt).toLocaleDateString('vi-VN') : assignment.deadline
            };
          }
          return assignment;
        }));
        
        showToast('Cập nhật thời gian thành công!', 'success');
        closeDeadlineModal();
      } else {
        throw new Error(response.message || 'Không thể cập nhật thời gian');
      }
    } catch (error) {
      console.error('Error saving deadline:', error);
      showToast(error.message || 'Có lỗi xảy ra khi cập nhật thời gian', 'error');
    } finally {
      setDeadlineModal(prev => ({ ...prev, saving: false }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-8 bg-gray-700 rounded mb-4 w-2/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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
              onClick={() => navigate("/lecturer/my-courses")}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={18} />
              Khóa học của tôi
            </button>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-emerald-400 font-medium">Bài tập</span>
          </div>
          <div className="text-sm text-blue-400 font-semibold">
            Tiến độ khóa học: {course.progress}%
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-emerald-400 font-medium">
            Khóa học
          </p>
          <h1 className="text-3xl font-bold text-white">
            {course.name}
          </h1>
          <p className="text-gray-400">{course.instructor?.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Sinh viên</p>
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
                {course.contents?.length || 0}
              </p>
            </div>
          </div>
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <BarChart3 size={22} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bài tập</p>
              <p className="text-xl font-semibold text-white">
                {assignments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white">
            Bài tập
          </button>
          <Link
            to={`/lecturer/courses/${courseId}`}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition"
          >
            Tổng quan
          </Link>
        </div>
      </section>

      <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Danh sách bài tập</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              Tổng {assignments.length} bài tập
            </span>
            {/* <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition">
              <Plus size={16} />
              Tạo bài tập
            </button> */}
          </div>
        </div>

        {assignments.length > 0 ? (
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
                      Deadline: {assignment.deadline}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusBadge[assignment.status]
                    }`}
                  >
                    {assignment.statusLabel}
                  </span>
                </div>

                <div className="text-sm text-gray-400">
                  Đã nộp {assignment.submitted}/{assignment.total}
                </div>
                <div className="h-2 bg-[#10151c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${assignment.progress}%` }}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-emerald-400 font-semibold">
                    Điểm TB:{" "}
                    {assignment.avgScore != null ? `${assignment.avgScore}%` : "--"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openDeadlineModal(assignment)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-white hover:border-emerald-500 transition"
                    >
                      <PenSquare size={16} />
                      Đặt deadline
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/lecturer/courses/${courseId}/assignments/${assignment.id}`, {
                          state: { from: `/lecturer/courses/${courseId}/assignments` },
                        })
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-black hover:bg-blue-400 transition"
                    >
                      Xem chi tiết
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0b0f12] border border-dashed border-[#202934] rounded-2xl">
            <div className="flex justify-center mb-4">
              <FileText size={64} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Chưa có bài tập
            </h3>
            <p className="text-gray-400 mb-6">
              Tạo bài tập đầu tiên cho khóa học này
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition">
              <Plus size={16} />
              Tạo bài tập
            </button>
          </div>
        )}
      </section>

      {/* Deadline Modal */}
      {deadlineModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeDeadlineModal}
          ></div>
          <div className="relative bg-[#0f1419] border border-[#202934] rounded-2xl w-full max-w-md p-6 space-y-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Đặt deadline cho bài tập</h3>
                <p className="text-sm text-gray-400">
                  {deadlineModal.assignment?.title}
                </p>
              </div>
              <button
                onClick={closeDeadlineModal}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Thời gian mở bài tập */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Ngày mở</label>
                <input
                  type="date"
                  value={deadlineModal.openDate}
                  onChange={(e) =>
                    setDeadlineModal((prev) => ({ ...prev, openDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#202934] bg-transparent px-4 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Giờ mở</label>
                <input
                  type="time"
                  value={deadlineModal.openTime}
                  onChange={(e) =>
                    setDeadlineModal((prev) => ({ ...prev, openTime: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#202934] bg-transparent px-4 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            
            {/* Thời gian deadline */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Ngày hết hạn</label>
                <input
                  type="date"
                  value={deadlineModal.dueDate}
                  onChange={(e) =>
                    setDeadlineModal((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#202934] bg-transparent px-4 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Giờ hết hạn</label>
                <input
                  type="time"
                  value={deadlineModal.dueTime}
                  onChange={(e) =>
                    setDeadlineModal((prev) => ({ ...prev, dueTime: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#202934] bg-transparent px-4 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl border border-[#202934] text-white hover:border-gray-500 transition"
                onClick={closeDeadlineModal}
                disabled={deadlineModal.saving}
              >
                Hủy
              </button>
              <button
                className="flex-1 py-3 rounded-xl bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSaveDeadline}
                disabled={deadlineModal.saving}
              >
                {deadlineModal.saving ? 'Lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}