import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Calendar,
  User,
  CheckCircle,
  Circle,
  Save,
} from "lucide-react";
import lecturerService from "../../services/lecturerService";

export default function ApplyResourceToCourse() {
  const { id } = useParams(); // Changed from resourceId to id
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null); // Changed from resource to tutorial
  const [loading, setLoading] = useState(true);
  const [selectedContents, setSelectedContents] = useState(new Set()); // Content IDs
  const [assignmentSchedules, setAssignmentSchedules] = useState({}); // Assignment schedules
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTutorialDetail = async () => {
      try {
        setLoading(true);
        const response = await lecturerService.getTutorialDetail(id);
        
        if (response.code === "ok") {
          setTutorial(response.data);
          
          // Initialize all contents as selected by default
          const contentIds = new Set();
          if (response.data.items) {
            response.data.items
              .filter(item => item.itemType === "CONTENT")
              .forEach(content => contentIds.add(content.id));
          }
          setSelectedContents(contentIds);

          // Initialize assignment schedules
          const schedules = {};
          if (response.data.items) {
            response.data.items
              .filter(item => item.itemType === "ASSIGNMENT")
              .forEach(assignment => {
                schedules[assignment.id] = {
                  openAt: "",
                  dueAt: ""
                };
              });
          }
          setAssignmentSchedules(schedules);
        }
      } catch (error) {
        console.error("Error fetching tutorial detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorialDetail();
  }, [id]);

  const handleContentToggle = (contentId) => {
    const newSelected = new Set(selectedContents);
    if (newSelected.has(contentId)) {
      newSelected.delete(contentId);
    } else {
      newSelected.add(contentId);
    }
    setSelectedContents(newSelected);
  };

  const handleScheduleChange = (assignmentId, field, value) => {
    setAssignmentSchedules(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        [field]: value
      }
    }));
  };

  const handleCreateCourse = () => {
    if (selectedContents.size === 0) {
      alert("Vui lòng chọn ít nhất một bài học");
      return;
    }

    // Prepare data to pass to create course page
    const selectedContentIds = Array.from(selectedContents);
    const schedules = Object.entries(assignmentSchedules)
      .filter(([, schedule]) => schedule.openAt && schedule.dueAt)
      .map(([assignmentId, schedule]) => ({
        assignmentId: parseInt(assignmentId),
        openAt: schedule.openAt,
        dueAt: schedule.dueAt
      }));

    const courseData = {
      tutorialId: tutorial.id,
      selectedContentIds,
      assignmentSchedules: schedules,
      tutorialTitle: tutorial.title,
      tutorialSummary: tutorial.summary
    };

    // Navigate to create course page with data
    navigate("/courses/create", { 
      state: courseData 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Không tìm thấy tutorial</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <button
            onClick={() => navigate("/resources")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={16} />
            Quay lại thư viện
          </button>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Áp dụng tutorial vào khóa học
            </h1>
            <h2 className="text-xl font-semibold text-emerald-400 mb-2">{tutorial.title}</h2>
            <p className="text-gray-400">{tutorial.summary}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User size={14} />
                {tutorial.createdByName || `User #${tutorial.createdBy}`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Tạo: {tutorial.createdAt?.substring(0, 10) || ""}
              </span>
            </div>
          </div>
        </div>



        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Bài học</p>
                <p className="text-xl font-bold text-white">
                  {tutorial.items ? tutorial.items.filter(item => item.itemType === "CONTENT").length : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ListChecks size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Bài tập</p>
                <p className="text-xl font-bold text-white">
                  {tutorial.items ? tutorial.items.filter(item => item.itemType === "ASSIGNMENT").length : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Đã chọn</p>
                <p className="text-xl font-bold text-white">
                  {selectedContents.size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Selection Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lessons Selection */}
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText size={20} />
                Chọn bài học
              </h3>
              <button
                onClick={() => {
                  const contentItems = tutorial.items?.filter(item => item.itemType === "CONTENT") || [];
                  if (contentItems.length > 0) {
                    const allContentIds = new Set(contentItems.map(c => c.id));
                    if (selectedContents.size === contentItems.length) {
                      setSelectedContents(new Set());
                    } else {
                      setSelectedContents(allContentIds);
                    }
                  }
                }}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition"
              >
                {(() => {
                  const contentItems = tutorial.items?.filter(item => item.itemType === "CONTENT") || [];
                  return selectedContents.size === contentItems.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả";
                })()}
              </button>
            </div>
            
            {(() => {
              const contentItems = tutorial.items?.filter(item => item.itemType === "CONTENT") || [];
              return contentItems.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {contentItems.map((content) => (
                    <div
                      key={content.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        selectedContents.has(content.id)
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : "bg-[#0f1419] border-[#202934] hover:border-emerald-500/50"
                      }`}
                      onClick={() => handleContentToggle(content.id)}
                    >
                      <div className="shrink-0">
                        {selectedContents.has(content.id) ? (
                          <CheckCircle size={20} className="text-emerald-400" />
                        ) : (
                          <Circle size={20} className="text-gray-600" />
                        )}
                      </div>
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <FileText size={16} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{content.title}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>Thứ tự: {content.orderNo}</span>
                          <span>Hình ảnh: {content.imageCount}</span>
                          <span>Video: {content.videoCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Không có bài học nào</p>
                </div>
              );
            })()}
          </div>

          {/* Assignment Scheduling */}
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Lên lịch bài tập
            </h3>
            
            {(() => {
              const assignmentItems = tutorial.items?.filter(item => item.itemType === "ASSIGNMENT") || [];
              return assignmentItems.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {assignmentItems.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 bg-[#0f1419] border border-[#202934] rounded-lg"
                    >
                      <div className="flex items-start gap-2 mb-3">
                        <div className="w-6 h-6 bg-purple-500/10 rounded flex items-center justify-center mt-0.5">
                          <ListChecks size={14} className="text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{assignment.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Điểm tối đa: {assignment.maxScore}</span>
                            <span>Kỹ năng: {assignment.skillName}</span>
                            <span>Số lần thử: {assignment.attemptsLimit}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Thời gian mở
                          </label>
                          <input
                            type="datetime-local"
                            value={assignmentSchedules[assignment.id]?.openAt || ""}
                            onChange={(e) => handleScheduleChange(assignment.id, "openAt", e.target.value)}
                            className="w-full px-3 py-2 bg-[#0b0f12] border border-[#202934] rounded-lg text-white text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Hạn nộp
                          </label>
                          <input
                            type="datetime-local"
                            value={assignmentSchedules[assignment.id]?.dueAt || ""}
                            onChange={(e) => handleScheduleChange(assignment.id, "dueAt", e.target.value)}
                            className="w-full px-3 py-2 bg-[#0b0f12] border border-[#202934] rounded-lg text-white text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <ListChecks size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Không có bài tập nào</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                Đã chọn {selectedContents.size} bài học
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {Object.values(assignmentSchedules).filter(s => s.openAt && s.dueAt).length} bài tập đã lên lịch
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/resources")}
                className="px-6 py-2.5 text-gray-400 hover:text-white border border-[#202934] hover:border-emerald-500 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateCourse}
                disabled={selectedContents.size === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-lg transition"
              >
                <Save size={20} />
                Tạo khóa học
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
