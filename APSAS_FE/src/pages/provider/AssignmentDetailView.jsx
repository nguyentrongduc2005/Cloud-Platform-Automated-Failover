import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  Award,
  Target,
  Hash,
  TrendingUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { getAssignmentById } from "../../services/resourceService";

export default function AssignmentDetailView() {
  const { resourceId, assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine back path based on current URL path
  const isViewMode = location.pathname.includes("/view/");
  const backPath = isViewMode
    ? `/provider/resources/${resourceId}/view`
    : `/provider/resources/${resourceId}`;

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const data = await getAssignmentById(resourceId, assignmentId);
        console.log("📦 Assignment detail:", data);
        setAssignment(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching assignment:", error);
        // Show clearer message for permission issues
        if (error?.response?.status === 401) {
          setError({
            code: 401,
            message: "Bạn không có quyền xem bài tập này.",
          });
        } else if (error?.response?.status === 404) {
          setError({ code: 404, message: "Bài tập không tồn tại." });
        } else {
          setError({
            code: error?.response?.status || 0,
            message: "Lỗi khi tải bài tập.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [resourceId, assignmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">
          {error ? (
            <>
              <div className="text-xl font-semibold mb-2">{error.message}</div>
              {error.code === 401 && (
                <div className="text-sm text-gray-400">
                  Vui lòng kiểm tra quyền truy cập hoặc đăng nhập lại.
                </div>
              )}
            </>
          ) : (
            "Không tìm thấy bài tập"
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>

        {/* Title */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold text-white">
              {assignment.title}
            </h1>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium">
              Order #{assignment.orderNo}
            </span>
          </div>

          {assignment.createdDate && (
            <p className="text-sm text-gray-400">
              Tạo ngày:{" "}
              {new Date(assignment.createdDate).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        {/* Assignment Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Award size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Điểm tối đa</p>
                <p className="text-xl font-bold text-white">
                  {assignment.maxScore}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Hash size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Số lần nộp</p>
                <p className="text-xl font-bold text-white">
                  {assignment.attemptsLimit || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Proficiency</p>
                <p className="text-xl font-bold text-white">
                  {assignment.proficiency || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Target size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Test Cases</p>
                <p className="text-xl font-bold text-white">
                  {assignment.testCases?.length || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statement */}
        {assignment.statementHtml && (
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Đề bài</h2>
            <div
              className="prose prose-invert prose-emerald max-w-none
                prose-headings:text-white 
                prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-3 prose-h1:mt-0
                prose-h2:text-xl prose-h2:font-bold prose-h2:mb-2 prose-h2:mt-6
                prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-3
                prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-semibold
                prose-em:text-gray-300 prose-em:italic
                prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-[#0f1419] prose-pre:border prose-pre:border-[#202934] prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-4
                prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-gray-300
                prose-ul:text-gray-300 prose-ul:list-disc prose-ul:ml-5 prose-ul:my-3
                prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:ml-5 prose-ol:my-3
                prose-li:mb-1 prose-li:text-gray-300
                prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400 prose-blockquote:my-4
                prose-table:w-full prose-table:border-collapse prose-table:my-4
                prose-thead:border-b-2 prose-thead:border-[#202934]
                prose-th:text-left prose-th:p-3 prose-th:text-white prose-th:font-semibold prose-th:bg-[#0f1419]
                prose-td:p-3 prose-td:text-gray-300 prose-td:border-t prose-td:border-[#202934]
                prose-tr:border-b prose-tr:border-[#202934]
                prose-img:rounded-lg prose-img:my-4
                prose-hr:border-[#202934] prose-hr:my-6
              "
              dangerouslySetInnerHTML={{ __html: assignment.statementHtml }}
            />
          </div>
        )}

        {/* Test Cases */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Test Cases</h2>

          {assignment.testCases && assignment.testCases.length > 0 ? (
            <div className="space-y-4">
              {assignment.testCases.map((testCase, index) => (
                <div
                  key={index}
                  className="bg-[#0f1419] border border-[#202934] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">
                      Test Case #{index + 1}
                    </h3>
                    <span
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        testCase.visibility === "PUBLIC"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {testCase.visibility === "PUBLIC" ? (
                        <>
                          <Eye size={14} />
                          Public
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} />
                          Private
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Input
                      </label>
                      <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-3">
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-all">
                          {testCase.in}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Expected Output
                      </label>
                      <div className="bg-[#0b0f12] border border-[#202934] rounded-lg p-3">
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-all">
                          {testCase.out}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Target size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Chưa có test case</p>
              <p className="text-sm mt-1">
                Test cases sẽ được hiển thị khi có dữ liệu từ hệ thống
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
