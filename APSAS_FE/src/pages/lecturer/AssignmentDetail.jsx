import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Timer,
  FileText,
  ExternalLink,
  PenSquare,
  X,
  Clock,
  Trophy,
  Star,
  Target,
} from "lucide-react";
import { marked } from "marked";
import  lecturerService  from "../../services/lecturerService";
import { getStudentsSubmissions, getTeacherSubmissionDetail } from "../../services/submissionService";
import { useToast } from '../../hooks/useToast';

// Configure marked options for better code highlighting
marked.setOptions({
  breaks: true,
  gfm: true,
});



export default function LecturerAssignmentDetail() {
  const { assignmentId, courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backDestination = location.state?.from ?? "/lecturer/assignments";
  const { showToast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState("detail"); // "detail" or "students"
  
  // Students submissions state
  const [studentsSubmissions, setStudentsSubmissions] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetailLoading, setSubmissionDetailLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [deadlineModal, setDeadlineModal] = useState({
    open: false,
    openDate: "",
    openTime: "00:00",
    dueDate: "",
    dueTime: "23:59",
    saving: false,
  });

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const response = await lecturerService.getAssignmentDetail(courseId, assignmentId);
        
        // Check if API response is successful
        if (response.code === "ok" || response.code === "0") {
          setAssignment(response.data);
          
          // Set deadline modal data from response
          if (response.data.openAt || response.data.dueAt) {
            setDeadlineModal(prev => ({
              ...prev,
              openDate: response.data.openAt ? response.data.openAt.split('T')[0] : '',
              openTime: response.data.openAt ? response.data.openAt.split('T')[1]?.substring(0, 5) || '00:00' : '00:00',
              dueDate: response.data.dueAt ? response.data.dueAt.split('T')[0] : '',
              dueTime: response.data.dueAt ? response.data.dueAt.split('T')[1]?.substring(0, 5) || '23:59' : '23:59',
            }));
          }
        } else {
          throw new Error(response.message || "Failed to load assignment");
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
        setError(error.message || "Không thể tải chi tiết bài tập");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId && courseId) {
      fetchAssignment();
    }
  }, [assignmentId, courseId]);

  const openDeadlineModal = () =>
    setDeadlineModal(prev => ({
      ...prev,
      open: true,
    }));

  const closeDeadlineModal = () =>
    setDeadlineModal(prev => ({
      ...prev,
      open: false,
      saving: false,
    }));

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
      
      const response = await lecturerService.setAssignmentTime(assignmentId, courseId, timeData);
      
      if (response.code === "ok" || response.code === "0") {
        // Refresh assignment data
        const updatedResponse = await lecturerService.getAssignmentDetail(courseId, assignmentId);
        if (updatedResponse.code === "ok" || updatedResponse.code === "0") {
          setAssignment(updatedResponse.data);
        }
        
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
    };
  };

  // Load students submissions
  const loadStudentsSubmissions = async () => {
    try {
      setStudentsLoading(true);
      const response = await getStudentsSubmissions(courseId, assignmentId);
      
      if (response && (response.code === "ok" || response.code === "0" || response.code === "OK")) {
        // API trả về pagination format: { content: [...], empty: false, ... }
        const submissions = response.data?.content || response.content || [];
        
        // Use studentId as submissionId for API call
        const processedSubmissions = submissions.map(submission => ({
          ...submission,
          submissionId: submission.studentId // API expects studentId
        }));
        
        setStudentsSubmissions(processedSubmissions);
        console.log('Loaded students submissions:', processedSubmissions);
      } else {
        showToast('Không thể tải danh sách sinh viên', 'error');
        setStudentsSubmissions([]);
      }
    } catch (error) {
      console.error("Error loading students submissions:", error);
      showToast('Không thể tải danh sách sinh viên', 'error');
      setStudentsSubmissions([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Load submission detail
  const loadSubmissionDetail = async (submissionId) => {
    try {
      setSubmissionDetailLoading(true);
      const response = await getTeacherSubmissionDetail(submissionId);
      
      if (response && (response.code === "ok" || response.code === "0" || response.code === "OK")) {
        setSelectedSubmission(response.data);
      } else {
        throw new Error(response?.message || "Không thể tải chi tiết submission");
      }
    } catch (error) {
      console.error("Error loading submission detail:", error);
      showToast(error.message || 'Không thể tải chi tiết bài nộp', 'error');
    } finally {
      setSubmissionDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-12">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg">{error || "Không tìm thấy bài tập"}</div>
          <button
            onClick={() => navigate(backDestination)}
            className="px-4 py-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-600 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(backDestination)}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-emerald-400 font-medium">
              Chi tiết bài tập
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-400 font-semibold">
            Assignment #{assignment.id}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight">
            {assignment.title}
          </h1>
          {assignment.skillName && (
            <div className="flex items-center gap-2 text-sm">
              <Target size={16} className="text-blue-400" />
              <span className="text-gray-400">Skill:</span>
              <span className="text-blue-400 font-medium">{assignment.skillName}</span>
            </div>
          )}
          {assignment.tutorialTitle && (
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="text-gray-400">Từ khóa học:</span>
              <span className="text-emerald-400 font-medium">{assignment.tutorialTitle}</span>
            </div>
          )}
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-[#202934]">
        <div className="flex gap-6">
          <button
            onClick={() => setViewMode("detail")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition relative ${
              viewMode === "detail"
                ? "text-emerald-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText size={18} />
            Chi tiết bài tập
            {viewMode === "detail" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
            )}
          </button>
          
          <button
            onClick={() => {
              setViewMode("students");
              if (studentsSubmissions.length === 0 && !studentsLoading) {
                loadStudentsSubmissions();
              }
            }}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition relative ${
              viewMode === "students"
                ? "text-emerald-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <CheckCircle2 size={18} />
            Sinh viên
            {viewMode === "students" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {viewMode === "detail" && (
          <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6 space-y-6">
            <div className="space-y-6">
              {/* Assignment Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarDays size={18} className="text-blue-400" />
                    <span className="text-sm text-gray-400">Thời gian</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Mở:</p>
                    <p className="text-sm font-medium text-white">
                      {assignment.openAt ? new Date(assignment.openAt).toLocaleDateString('vi-VN') : 'Chưa đặt'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Hạn nộp:</p>
                    <p className="text-sm font-medium text-white">
                      {assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString('vi-VN') : 'Chưa đặt'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy size={18} className="text-yellow-400" />
                    <span className="text-sm text-gray-400">Điểm số</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Tổng điểm:</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {assignment.maxScore || 100}
                    </p>
                    <p className="text-xs text-gray-400">điểm</p>
                  </div>
                </div>

                <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={18} className="text-purple-400" />
                    <span className="text-sm text-gray-400">Giới hạn nộp bài</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-purple-400">
                      {assignment.attemptsLimit || '--'}
                    </p>
                    <p className="text-xs text-gray-400">lần</p>
                  </div>
                </div>
              </div>

              {/* Assignment Statement */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText size={20} className="text-emerald-400" />
                  Đề bài
                </h3>
                
                <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
                  <div
                    className="prose prose-invert max-w-none text-gray-300 leading-relaxed
                      prose-headings:text-white 
                      prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
                      prose-h2:text-xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-6
                      prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
                      prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-white prose-strong:font-semibold
                      prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-[#0f1419] prose-pre:border prose-pre:border-[#202934] prose-pre:rounded-lg prose-pre:p-4
                      prose-ul:text-gray-300 prose-ul:list-disc prose-ul:ml-6
                      prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:ml-6
                      prose-li:mb-2
                      prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
                    "
                    dangerouslySetInnerHTML={{ __html: marked(assignment.statementMd || '') }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={openDeadlineModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#202934] text-white hover:border-emerald-500 hover:text-emerald-400 transition"
                >
                  <PenSquare size={20} />
                  Đặt deadline
                </button>
              </div>
            </div>
          </section>
        )}
        
        {viewMode === "students" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students List */}
            <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Danh sách sinh viên đã nộp bài</h3>
              
              {studentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-400">Đang tải...</div>
                </div>
              ) : studentsSubmissions.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {studentsSubmissions
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((student, index) => (
                    <div
                      key={student.studentId || index}
                      className="bg-[#0b0f12] border border-[#202934] rounded-lg p-4 hover:border-emerald-500/50 transition cursor-pointer"
                      onClick={() => {
                        // Load submission detail using studentId
                        console.log('Loading submission for studentId:', student.submissionId, 'student:', student.studentName);
                        loadSubmissionDetail(student.submissionId);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-white">{student.studentName}</h4>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium min-w-20 justify-center ${
                                student.passed
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : "text-red-400 bg-red-500/10"
                              }`}
                            >
                              {student.passed ? (
                                <><CheckCircle2 size={12} /> Đạt</>
                              ) : (
                                <><X size={12} /> Không đạt</>
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-1">{student.studentEmail}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Lần nộp {student.attemptNo}</span>
                            {student.submittedAt && (
                              <span>
                                {new Date(student.submittedAt).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-emerald-400">
                            {student.score || 0}
                          </div>
                          <div className="text-xs text-gray-400">Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                  
                  {/* Pagination */}
                  {studentsSubmissions.length > itemsPerPage && (
                    <div className="flex items-center justify-between pt-4 border-t border-[#202934]">
                      <div className="text-sm text-gray-400">
                        Hiển thị {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, studentsSubmissions.length)} trong {studentsSubmissions.length} bài nộp
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm rounded border border-[#202934] text-gray-300 hover:text-white hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Trước
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-300">
                          Trang {currentPage} / {Math.ceil(studentsSubmissions.length / itemsPerPage)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(studentsSubmissions.length / itemsPerPage)))}
                          disabled={currentPage === Math.ceil(studentsSubmissions.length / itemsPerPage)}
                          className="px-3 py-1 text-sm rounded border border-[#202934] text-gray-300 hover:text-white hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircle2 size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Chưa có sinh viên nào nộp bài</p>
                </div>
              )}
            </section>

            {/* Submission Detail */}
            <section className="bg-[#0f1419] border border-[#202934] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Chi tiết bài nộp</h3>
              
              {submissionDetailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-400">Đang tải...</div>
                </div>
              ) : selectedSubmission ? (
                <div className="space-y-6">
                  {/* Submission Header */}
                  <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {selectedSubmission.passed ? (
                          <CheckCircle2 size={20} className="text-emerald-400" />
                        ) : (
                          <X size={20} className="text-red-400" />
                        )}
                        <h4 className="text-lg font-semibold text-white">
                          {selectedSubmission.passed ? "Đạt" : "Không đạt"}
                        </h4>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-400">
                          {selectedSubmission.score}/100
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Ngôn ngữ:</span>
                        <span className="text-white ml-2">{selectedSubmission.language}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Lần nộp:</span>
                        <span className="text-white ml-2">#{selectedSubmission.attemptNo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Code */}
                  {selectedSubmission.code && (
                    <div>
                      <h5 className="font-semibold text-white mb-3">Code</h5>
                      <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-4">
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto">
                          {selectedSubmission.code}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Test Cases */}
                  {selectedSubmission.testCases && selectedSubmission.testCases.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-white mb-3">Test Cases</h5>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedSubmission.testCases.map((testCase, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-3 ${
                              testCase.status === "Accepted"
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : "border-red-500/30 bg-red-500/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-white">
                                Test Case {index + 1}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                testCase.status === "Accepted"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}>
                                {testCase.status}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                testCase.visibility === "PUBLIC" 
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}>
                                {testCase.visibility}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="text-gray-400 mb-1">Input:</div>
                                <code className="block bg-[#0f1419] p-1 rounded text-gray-300">
                                  {testCase.stdin}
                                </code>
                              </div>
                              <div>
                                <div className="text-gray-400 mb-1">Output:</div>
                                <code className="block bg-[#0f1419] p-1 rounded text-gray-300">
                                  {testCase.stdout}
                                </code>
                              </div>
                              <div>
                                <div className="text-gray-400 mb-1">Expected:</div>
                                <code className="block bg-[#0f1419] p-1 rounded text-gray-300">
                                  {testCase.expectedOutput}
                                </code>
                              </div>
                            </div>
                            
                            {testCase.time && testCase.memory && (
                              <div className="flex gap-3 text-xs text-gray-400 mt-2">
                                <span>Time: {testCase.time}s</span>
                                <span>Memory: {(testCase.memory / 1024).toFixed(1)}KB</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Chọn một sinh viên để xem chi tiết bài nộp</p>
                </div>
              )}
            </section>
          </div>
        )}


      </div>

      {/* Deadline Modal */}
      {deadlineModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeDeadlineModal}
          ></div>
          <div className="relative bg-[#0f1419] border border-[#202934] rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Đặt deadline cho bài tập
                </h3>
                <p className="text-sm text-gray-400">{assignment.title}</p>
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
                    setDeadlineModal((prev) => ({
                      ...prev,
                      openDate: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#202934] bg-[#0b0f12] px-4 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Giờ mở</label>
                <input
                  type="time"
                  value={deadlineModal.openTime}
                  onChange={(e) =>
                    setDeadlineModal((prev) => ({
                      ...prev,
                      openTime: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#202934] bg-[#0b0f12] px-4 py-2 text-white focus:border-emerald-500 outline-none"
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
                    setDeadlineModal((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#202934] bg-[#0b0f12] px-4 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Giờ hết hạn</label>
                <input
                  type="time"
                  value={deadlineModal.dueTime}
                  onChange={(e) =>
                    setDeadlineModal((prev) => ({
                      ...prev,
                      dueTime: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#202934] bg-[#0b0f12] px-4 py-2 text-white focus:border-emerald-500 outline-none"
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
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
