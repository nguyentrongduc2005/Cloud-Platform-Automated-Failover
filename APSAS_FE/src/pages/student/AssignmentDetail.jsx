import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
const Editor = lazy(() => import("@monaco-editor/react"));
import {
  ArrowLeft,
  Send,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  Timer,
  Award,
  Target,
  Hash,
  TrendingUp,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import studentCourseService from "../../services/studentCourseService";
import { createSubmission, pollSubmissionResult, getSubmissionHistory, getSubmissionById } from "../../services/submissionService";
import LanguageSelector from "../../components/student/LanguageSelector";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export default function StudentAssignmentDetail() {
  const navigate = useNavigate();
  const { assignmentId, courseId } = useParams();

  // API state
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Layout tabs: description | submissions | result
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  
  // Language and code state
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [code, setCode] = useState("");
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [pollingProgress, setPollingProgress] = useState("");
  
  // Submissions history state
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [isViewingSubmission, setIsViewingSubmission] = useState(false);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCode(language.template);
  };

  // Initialize with default language
  useEffect(() => {
    if (!selectedLanguage) {
      // Default to Java
      const defaultLang = {
        id: 91,
        name: "Java",
        version: "17",
        template: "public class Solution {\n    public String solve(String input) {\n        // Your code here\n        return \"\";\n    }\n}"
      };
      setSelectedLanguage(defaultLang);
      setCode(defaultLang.template);
    }
  }, [selectedLanguage]);

  // Load assignment data from API
  useEffect(() => {
    const loadAssignmentData = async () => {
      try {
        setLoading(true);
        const response = await studentCourseService.getAssignmentDetail(courseId, assignmentId);
        
        if (response && response.code === "ok") {
          setAssignment(response.data);
        } else {
          throw new Error(response?.message || "Failed to load assignment");
        }
      } catch (err) {
        console.error('Error loading assignment:', err);
        setError(err.message || "Có lỗi xảy ra khi tải bài tập");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId && courseId) {
      loadAssignmentData();
    }
  }, [assignmentId, courseId]);

  // Load submissions history
  const loadSubmissionsHistory = async () => {
    try {
      setSubmissionsLoading(true);
      const response = await getSubmissionHistory(courseId, assignmentId);
      
      if (response && response.code === "ok") {
        // API returns data.items array
        setSubmissions(response.data?.items || []);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Error loading submissions:', err);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Handle submission click
  const handleSubmissionClick = async (submission) => {
    try {
      setActiveLeftTab("result");
      setIsPolling(true);
      setSubmissionResult(null);
      setPollingProgress("Đang tải kết quả submission...");
      
      const result = await getSubmissionById(submission.id);
      
      if (result?.data) {
        setSubmissionResult(result.data);
        setPollingProgress("");
        
        // Set viewing submission mode and update code editor
        setIsViewingSubmission(true);
        if (result.data.code) {
          setCode(result.data.code);
        }
        
        // Update language selector to match submission language
        if (result.data.language) {
          const langMap = {
            "91": { id: 91, name: "Java", version: "17" },
            "102": { id: 102, name: "JavaScript", version: "ES2022" },
            "106": { id: 106, name: "Go", version: "1.21" },
            "113": { id: 113, name: "Python", version: "3.11" },
            "105": { id: 105, name: "C++", version: "17" },
            "java": { id: 91, name: "Java", version: "17" },
            "javascript": { id: 102, name: "JavaScript", version: "ES2022" },
            "go": { id: 106, name: "Go", version: "1.21" },
            "python": { id: 113, name: "Python", version: "3.11" },
            "cpp": { id: 105, name: "C++", version: "17" }
          };
          const lang = langMap[result.data.language];
          if (lang) {
            setSelectedLanguage({ ...lang, template: result.data.code || "" });
          }
        }
      } else {
        throw new Error("Không thể tải kết quả submission");
      }
    } catch (error) {
      console.error("Error loading submission result:", error);
      alert(`Có lỗi xảy ra: ${error.message}`);
      setActiveLeftTab("submissions");
    } finally {
      setIsPolling(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Vui lòng viết code trước khi nộp bài!");
      return;
    }

    if (!selectedLanguage) {
      alert("Vui lòng chọn ngôn ngữ!");
      return;
    }

    const confirmed = window.confirm("Bạn có chắc chắn muốn nộp bài?");
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      setIsPolling(false);
      setSubmissionResult(null);
      setPollingProgress("Đang tạo submission...");
      
      // Reset viewing submission mode when creating new submission
      setIsViewingSubmission(false);

      // Create submission
      const submissionData = {
        languageId: selectedLanguage.id,
        assignmentId: parseInt(assignmentId),
        courseId: parseInt(courseId),
        code: code
      };

      const createResponse = await createSubmission(submissionData);
      
      if (createResponse.code === "ok" && createResponse.data?.submissionId) {
        const submissionId = createResponse.data.submissionId;
        
        setIsSubmitting(false);
        setIsPolling(true);
        setActiveLeftTab("result");
        setPollingProgress("Đang xử lý submission...");

        // Start polling for result
        const result = await pollSubmissionResult(submissionId, {
          maxAttempts: 30,
          interval: 2000,
          onProgress: (response, attempts) => {
            setPollingProgress(`Đang kiểm tra kết quả... (lần thử ${attempts})`);
          }
        });

        if (result?.data) {
          setSubmissionResult(result.data);
          setPollingProgress("");
          // Refresh submissions history after successful submit
          loadSubmissionsHistory();
        } else {
          throw new Error("Không nhận được kết quả");
        }
      } else {
        throw new Error(createResponse.message || "Tạo submission thất bại");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Có lỗi xảy ra: ${error.message}`);
      setActiveLeftTab("description");
    } finally {
      setIsSubmitting(false);
      setIsPolling(false);
    }
  };



  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-6 animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-8 bg-gray-700 rounded mb-4 w-2/3"></div>
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0f1419] border border-red-500/50 rounded-xl p-6 text-center">
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

  // No assignment data
  if (!assignment) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-6 text-center">
          <div className="text-gray-400">Không tìm thấy bài tập</div>
        </div>
      </div>
    );
  }

  const isOverdue = assignment?.dueAt && new Date(assignment.dueAt) < new Date();
  const isOpen = assignment?.openAt && new Date(assignment.openAt) <= new Date();

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Header với Submit button */}
      <div className="border-b border-[#202934] bg-[#0b0f12]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <ArrowLeft size={18} />
                Quay lại
              </button>
              
              {assignment && (
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    {assignment.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Award size={14} />
                      Max: {assignment.maxScore}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash size={14} />
                      Attempts: {assignment.attemptsLimit}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={14} />
                      Level: {assignment.proficiency}
                    </span>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      isOverdue 
                        ? 'bg-red-500/10 text-red-400'
                        : isOpen
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {isOverdue ? 'Hết hạn' : isOpen ? 'Đang mở' : 'Chưa mở'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!code.trim() || !selectedLanguage || !isOpen || isOverdue || isSubmitting || isPolling}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-black rounded-lg hover:bg-emerald-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isPolling ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {isSubmitting ? "Đang nộp..." : isPolling ? "Đang xử lý..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: 2 columns như LeetCode */}
      <div className="max-w-7xl mx-auto flex h-[calc(100vh-80px)]">
        {/* Left Panel: Description + Submissions */}
        <div className="w-1/2 border-r border-[#202934] flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-[#202934]">
            <button
              onClick={() => {
                setActiveLeftTab("description");
                // Reset to editing mode when going back to description
                if (isViewingSubmission) {
                  setIsViewingSubmission(false);
                  // Optionally reset to default template
                  if (selectedLanguage?.template) {
                    setCode(selectedLanguage.template);
                  }
                }
              }}
              className={`px-4 py-3 text-sm font-medium transition ${
                activeLeftTab === "description"
                  ? "text-emerald-400 border-b-2 border-emerald-400 bg-[#0b0f12]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => {
                setActiveLeftTab("submissions");
                if (submissions.length === 0 && !submissionsLoading) {
                  loadSubmissionsHistory();
                }
              }}
              className={`px-4 py-3 text-sm font-medium transition ${
                activeLeftTab === "submissions"
                  ? "text-emerald-400 border-b-2 border-emerald-400 bg-[#0b0f12]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Submissions
            </button>
            {(submissionResult || isPolling) && (
              <button
                onClick={() => setActiveLeftTab("result")}
                className={`px-4 py-3 text-sm font-medium transition ${
                  activeLeftTab === "result"
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-[#0b0f12]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {isPolling ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Result
                  </span>
                ) : (
                  "Result"
                )}
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Đang tải...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-400 mb-2">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-600 transition"
                >
                  Thử lại
                </button>
              </div>
            ) : activeLeftTab === "description" ? (
              <div className="space-y-6">
                {/* Problem Statement */}
                {assignment?.statementMd && (
                  <div>
                    <div 
                      className="prose prose-invert prose-emerald max-w-none
                        prose-headings:text-white 
                        prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-0
                        prose-h2:text-xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-6
                        prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
                        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                        prose-strong:text-white prose-strong:font-semibold
                        prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-[#0f1419] prose-pre:border prose-pre:border-[#202934] prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-4
                        prose-ul:text-gray-300 prose-ul:list-disc prose-ul:ml-5 prose-ul:my-3
                        prose-li:mb-1 prose-li:text-gray-300
                        prose-table:w-full prose-table:border-collapse prose-table:my-4
                        prose-thead:border-b-2 prose-thead:border-[#202934]
                        prose-th:text-left prose-th:p-3 prose-th:text-white prose-th:font-semibold prose-th:bg-[#0f1419]
                        prose-td:p-3 prose-td:text-gray-300 prose-td:border-t prose-td:border-[#202934]
                      "
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      >
                        {assignment.statementMd}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Sample Test Cases */}
                {assignment?.testCases && assignment.testCases.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Test Cases</h3>
                    <div className="space-y-4">
                      {assignment.testCases.map((testCase, index) => (
                        <div key={index} className="bg-[#0b0f12] border border-[#202934] rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-semibold text-emerald-400">
                              Test Case {index + 1}
                            </span>
                            {testCase.visibility && (
                              <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                testCase.visibility === "PUBLIC" 
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-gray-500/10 text-gray-400"
                              }`}>
                                {testCase.visibility === "PUBLIC" ? (
                                  <><Eye size={12} /> Public</>
                                ) : (
                                  <><EyeOff size={12} /> Private</>
                                )}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-400 mb-2">Input:</div>
                              <div className="bg-[#0f1419] border border-[#202934] rounded p-3">
                                <code className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                  {testCase.in || testCase.input}
                                </code>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-2">Expected Output:</div>
                              <div className="bg-[#0f1419] border border-[#202934] rounded p-3">
                                <code className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                  {testCase.out || testCase.output}
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeLeftTab === "submissions" ? (
              /* Submissions Tab */
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Lịch sử nộp bài</h3>
                
                {submissionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-emerald-400" />
                    <span className="ml-2 text-gray-400">Đang tải...</span>
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="bg-[#0b0f12] border border-[#202934] rounded-lg p-4 hover:border-emerald-500/50 transition cursor-pointer"
                        onClick={() => handleSubmissionClick(submission)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium min-w-20 ${
                                  submission.passed && submission.score > 0
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : "text-red-400 bg-red-500/10"
                                }`}
                              >
                                {submission.passed && submission.score > 0 ? (
                                  <><CheckCircle2 size={12} /> Đạt</>
                                ) : (
                                  <><XCircle size={12} /> Không đạt</>
                                )}
                              </span>
                              <span className="text-sm text-gray-400">
                                {submission.language === "91" ? "Java" :
                                 submission.language === "102" ? "JavaScript" :
                                 submission.language === "106" ? "Go" :
                                 submission.language === "113" ? "Python" :
                                 submission.language === "105" ? "C++" :
                                 submission.language || "Unknown"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>Lần nộp {submission.attemptNo || 'N/A'}</span>
                              </div>
                              {submission.submittedAt && (
                                <span>
                                  {new Date(submission.submittedAt).toLocaleDateString('vi-VN', {
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
                              {submission.score || 0}
                            </div>
                            <div className="text-xs text-gray-400">Score</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Chưa có bài nộp nào</p>
                    <p className="text-sm mt-2">Nộp bài đầu tiên của bạn để xem lịch sử</p>
                  </div>
                )}
              </div>
            ) : (
              /* Result Tab */
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Submission Result</h3>
                
                {isPolling ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={48} className="animate-spin text-emerald-400 mb-4" />
                    <p className="text-gray-400 text-center">{pollingProgress}</p>
                    <p className="text-sm text-gray-500 mt-2">Đang chờ hệ thống xử lý submission...</p>
                  </div>
                ) : submissionResult ? (
                  <div className="space-y-6">
                    {/* Status Header */}
                    <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {submissionResult.passed ? (
                            <CheckCircle2 size={24} className="text-emerald-400" />
                          ) : (
                            <XCircle size={24} className="text-red-400" />
                          )}
                          <div>
                            <h4 className="text-xl font-bold text-white">
                              {submissionResult.passed ? "Accepted" : "Wrong Answer"}
                            </h4>
                            <p className="text-gray-400 text-sm">Language: {submissionResult.language}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-400">
                            {submissionResult.score}/100
                          </div>
                          <p className="text-sm text-gray-400">Score</p>
                        </div>
                      </div>
                      
                      {/* Performance Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Attempt:</span>
                          <span className="text-white">#{submissionResult.attemptNo}</span>
                        </div>
                        {submissionResult.bigOComplexityTime && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Time Complexity:</span>
                            <span className="text-white">{submissionResult.bigOComplexityTime}</span>
                          </div>
                        )}
                        {submissionResult.bigOComplexitySpace && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Space Complexity:</span>
                            <span className="text-white">{submissionResult.bigOComplexitySpace}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* AI Feedback */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                        <AlertCircle size={16} />
                        AI Feedback
                      </h5>
                      <div className="space-y-3">
                        {submissionResult.feedback && (
                          <div>
                            <h6 className="text-sm font-medium text-blue-300 mb-2">Analysis:</h6>
                            <p className="text-blue-200 text-sm leading-relaxed">{submissionResult.feedback}</p>
                          </div>
                        )}
                        {submissionResult.suggestion && (
                          <div>
                            <h6 className="text-sm font-medium text-blue-300 mb-2">Suggestion:</h6>
                            <div className="text-blue-200 text-sm leading-relaxed whitespace-pre-wrap">{submissionResult.suggestion}</div>
                          </div>
                        )}
                        {!submissionResult.feedback && !submissionResult.suggestion && (
                          <p className="text-blue-300 text-sm italic">Chưa có phân tích từ AI</p>
                        )}
                      </div>
                    </div>

                    {/* Teacher Feedback */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                      <h5 className="font-semibold text-emerald-400 mb-3">Teacher Feedback</h5>
                      {submissionResult.feedbackTeachers && submissionResult.feedbackTeachers.length > 0 ? (
                        <div className="space-y-2">
                          {submissionResult.feedbackTeachers.map((feedback, index) => (
                            <p key={index} className="text-emerald-200 text-sm leading-relaxed">{feedback}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-emerald-300 text-sm italic">Chưa có phản hồi từ giáo viên</p>
                      )}
                    </div>

                    {/* Test Cases */}
                    {submissionResult.testCases && submissionResult.testCases.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-white mb-3">Test Cases</h5>
                        <div className="space-y-3">
                          {submissionResult.testCases.map((testCase, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 ${
                                testCase.status === "Wrong Answer"
                                  ? "border-red-500/30 bg-red-500/5"
                                  : "border-emerald-500/30 bg-emerald-500/5"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm font-medium text-white">
                                  Test Case {index + 1}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  testCase.status === "Wrong Answer"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-emerald-500/20 text-emerald-400"
                                }`}>
                                  {testCase.status}
                                </span>
                                {testCase.visibility && (
                                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                    testCase.visibility === "PUBLIC" 
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-gray-500/10 text-gray-400"
                                  }`}>
                                    {testCase.visibility === "PUBLIC" ? (
                                      <><Eye size={12} /> Public</>
                                    ) : (
                                      <><EyeOff size={12} /> Private</>
                                    )}
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3 text-sm">
                                <div>
                                  <div className="text-gray-400 mb-1">Input:</div>
                                  <code className="block bg-[#0f1419] p-2 rounded border border-[#202934] text-gray-300">
                                    {testCase.stdin}
                                  </code>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-gray-400 mb-1">Your Output:</div>
                                    <code className="block bg-[#0f1419] p-2 rounded border border-[#202934] text-gray-300">
                                      {testCase.stdout}
                                    </code>
                                  </div>
                                  <div>
                                    <div className="text-gray-400 mb-1">Expected:</div>
                                    <code className="block bg-[#0f1419] p-2 rounded border border-[#202934] text-gray-300">
                                      {testCase.expectedOutput}
                                    </code>
                                  </div>
                                </div>
                                {testCase.time && testCase.memory && (
                                  <div className="flex gap-4 text-xs text-gray-400">
                                    <span>Time: {testCase.time}s</span>
                                    <span>Memory: {(testCase.memory / 1024).toFixed(1)}KB</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Chưa có kết quả submission</p>
                    <p className="text-sm mt-2">Submit code để xem kết quả</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Code Editor Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#202934]">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Code</h3>
              {isViewingSubmission && (
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/30">
                  Viewing Submission
                </span>
              )}
            </div>
            
            {/* Language Selector */}
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">Loading editor...</div>
                </div>
              }
            >
              <Editor
                height="100%"
                language={selectedLanguage?.name?.toLowerCase() === "go" ? "go" : selectedLanguage?.name?.toLowerCase()}
                value={code}
                onChange={isViewingSubmission ? undefined : (value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                  readOnly: isViewingSubmission,
                }}
              />
            </Suspense>
          </div>


        </div>
      </div>
    </div>
  );
}
