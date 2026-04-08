import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentById,
  getSkills,
} from "../../services/resourceService";

export default function CreateAssignment() {
  const { resourceId, assignmentId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!assignmentId;

  const [assignment, setAssignment] = useState({
    title: "",
    orderNo: 1,
    maxScore: 100,
    attemptLimit: 3,
    proficiency: 1,
    skillId: "",
    statement: "",
  });

  const [testCases, setTestCases] = useState([
    { input: "", output: "", visibility: "PUBLIC" },
  ]);

  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${assignment.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAssignment(resourceId, assignmentId);
      toast.success("Xóa bài tập thành công!", {
        description: `Bài tập "${assignment.title}" đã bị xóa`
      });
      navigate(`/provider/resources/${resourceId}`);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Có lỗi xảy ra khi xóa bài tập";
      
      toast.error("Xóa bài tập thất bại", {
        description: errorMessage
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const loadSkills = async () => {
    if (skills.length > 0) return; // Đã load rồi thì không load lại
    
    setSkillsLoading(true);
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Không thể tải danh sách skills", {
        description: "Vui lòng thử lại sau"
      });
    } finally {
      setSkillsLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      const fetchAssignment = async () => {
        try {
          setLoading(true);
          const data = await getAssignmentById(resourceId, assignmentId);
          setAssignment({
            title: data.title,
            orderNo: data.orderNo,
            maxScore: data.maxScore,
            attemptLimit: data.attemptLimit,
            proficiency: data.proficiency || 1,
            skillId: data.skillId,
            statement: data.statement || "",
          });
          setTestCases(
            data.testCases || [{ input: "", output: "", visibility: "PUBLIC" }]
          );
        } catch (error) {
          console.error("Error fetching assignment:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAssignment();
    }
  }, [isEdit, resourceId, assignmentId]);

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { input: "", output: "", visibility: "PUBLIC" },
    ]);
  };

  const removeTestCase = (index) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleSave = async () => {
    if (!assignment.title.trim() || !assignment.skillId) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const validTestCases = testCases.filter(
      (tc) => tc.input.trim() && tc.output.trim()
    );

    if (validTestCases.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 test case hợp lệ");
      return;
    }

    setIsSaving(true);
    try {
      // Tạo payload theo đúng format API
      const evaluations = [{
        name: "Chấm code tự động",
        type: "RCE_JUDGE",
        configJson: JSON.stringify({
          testCase: validTestCases.map(tc => ({
            in: tc.input,
            out: tc.output,
            visibility: tc.visibility || "PUBLIC"
          }))
        })
      }];

      const data = {
        skillId: parseInt(assignment.skillId),
        title: assignment.title,
        statementMd: assignment.statement,
        maxScore: parseFloat(assignment.maxScore),
        proficiency: parseInt(assignment.proficiency),
        orderNo: parseInt(assignment.orderNo),
        attemptsLimit: parseInt(assignment.attemptLimit),
        evaluations
      };

      if (isEdit) {
        await updateAssignment(resourceId, assignmentId, data);
        toast.success("Cập nhật bài tập thành công!", {
          description: `Bài tập "${assignment.title}" đã được cập nhật`
        });
      } else {
        await createAssignment(resourceId, data);
        toast.success("Tạo bài tập thành công!", {
          description: `Bài tập "${assignment.title}" đã được tạo với ${validTestCases.length} test case`
        });
      }
      navigate(`/provider/resources/${resourceId}`);
    } catch (error) {
      console.error("Error saving assignment:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Có lỗi xảy ra khi lưu bài tập";
      
      toast.error(isEdit ? "Cập nhật bài tập thất bại" : "Tạo bài tập thất bại", {
        description: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/provider/resources/${resourceId}`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-white">
              {isEdit ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isEdit && (
              <button
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Thông tin cơ bản</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tiêu đề <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={assignment.title}
                onChange={(e) =>
                  setAssignment({ ...assignment, title: e.target.value })
                }
                placeholder="Nhập tiêu đề bài tập..."
                className="w-full bg-[#0f1419] border border-[#202934] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order No <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={assignment.orderNo}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    orderNo: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                className="w-full bg-[#0f1419] border border-[#202934] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Score <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={assignment.maxScore}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    maxScore: parseInt(e.target.value) || 100,
                  })
                }
                min="1"
                className="w-full bg-[#0f1419] border border-[#202934] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attempt Limit <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={assignment.attemptLimit}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    attemptLimit: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                className="w-full bg-[#0f1419] border border-[#202934] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proficiency (1-5) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={assignment.proficiency}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    proficiency: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                max="5"
                className="w-full bg-[#0f1419] border border-[#202934] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skill <span className="text-red-400">*</span>
              </label>
              <select
                value={assignment.skillId}
                onChange={(e) =>
                  setAssignment({ ...assignment, skillId: e.target.value })
                }
                onFocus={loadSkills} // Load skills khi user click vào dropdown
                className="w-full bg-[#0f1419] border border-[#202934] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50"
                disabled={skillsLoading}
              >
                <option value="">
                  {skillsLoading ? "Đang tải skills..." : "-- Chọn skill --"}
                </option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} - {skill.category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statement Section */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Đề bài</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Markdown Input */}
            <div className="bg-[#0f1419] border border-[#202934] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#202934] bg-[#0b0f12]">
                <h3 className="text-sm font-semibold text-white">Markdown</h3>
              </div>
              <textarea
                value={assignment.statement}
                onChange={(e) =>
                  setAssignment({ ...assignment, statement: e.target.value })
                }
                placeholder="# Đề bài&#10;&#10;Nhập nội dung đề bài markdown...&#10;&#10;## Yêu cầu&#10;&#10;- Yêu cầu 1&#10;- Yêu cầu 2&#10;&#10;## Ví dụ&#10;&#10;```&#10;Input: ...&#10;Output: ...&#10;```"
                className="w-full h-[400px] bg-[#0f1419] text-white p-4 focus:outline-none resize-none font-mono text-sm"
              />
            </div>

            {/* Preview */}
            <div className="bg-[#0f1419] border border-[#202934] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#202934] bg-[#0b0f12]">
                <h3 className="text-sm font-semibold text-white">Preview</h3>
              </div>
              <div className="p-4 h-[400px] overflow-y-auto">
                <div
                  className="prose prose-invert prose-emerald max-w-none
                    prose-headings:text-white 
                    prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-3 prose-h1:mt-0
                    prose-h2:text-xl prose-h2:font-bold prose-h2:mb-2 prose-h2:mt-6
                    prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
                    prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-3 prose-p:text-sm
                    prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-white prose-strong:font-semibold
                    prose-em:text-gray-300 prose-em:italic
                    prose-code:text-emerald-400 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-[#0b0f12] prose-pre:border prose-pre:border-[#202934] prose-pre:rounded-lg prose-pre:p-3 prose-pre:my-3 prose-pre:text-sm
                    prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-gray-300
                    prose-ul:text-gray-300 prose-ul:list-disc prose-ul:ml-5 prose-ul:my-3 prose-ul:text-sm
                    prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:ml-5 prose-ol:my-3 prose-ol:text-sm
                    prose-li:mb-1 prose-li:text-gray-300
                    prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-gray-400 prose-blockquote:my-3 prose-blockquote:text-sm
                    prose-table:w-full prose-table:border-collapse prose-table:my-3 prose-table:text-sm
                    prose-thead:border-b-2 prose-thead:border-[#202934]
                    prose-th:text-left prose-th:p-2 prose-th:text-white prose-th:font-semibold prose-th:bg-[#0b0f12] prose-th:text-xs
                    prose-td:p-2 prose-td:text-gray-300 prose-td:border-t prose-td:border-[#202934] prose-td:text-xs
                    prose-tr:border-b prose-tr:border-[#202934]
                    prose-img:rounded-lg prose-img:my-3
                    prose-hr:border-[#202934] prose-hr:my-6
                  "
                >
                  <ReactMarkdown
                    key={assignment.statement.length}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  >
                    {assignment.statement || "*Nhập đề bài để xem preview...*"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Test Cases</h2>
            <button
              onClick={addTestCase}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition"
            >
              <Plus size={16} />
              Thêm test case
            </button>
          </div>

          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <div
                key={index}
                className="bg-[#0f1419] border border-[#202934] rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Test Case #{index + 1}
                  </h3>
                  {testCases.length > 1 && (
                    <button
                      onClick={() => removeTestCase(index)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Input
                    </label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) =>
                        updateTestCase(index, "input", e.target.value)
                      }
                      placeholder="Nhập input..."
                      rows={3}
                      className="w-full bg-[#0b0f12] border border-[#202934] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Expected Output
                    </label>
                    <textarea
                      value={testCase.output}
                      onChange={(e) =>
                        updateTestCase(index, "output", e.target.value)
                      }
                      placeholder="Nhập expected output..."
                      rows={3}
                      className="w-full bg-[#0b0f12] border border-[#202934] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Visibility
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`visibility-${index}`}
                        value="PUBLIC"
                        checked={testCase.visibility === "PUBLIC"}
                        onChange={(e) =>
                          updateTestCase(index, "visibility", e.target.value)
                        }
                        className="text-emerald-500"
                      />
                      <span className="text-sm text-gray-300 flex items-center gap-1">
                        <Eye size={14} />
                        Public
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`visibility-${index}`}
                        value="PRIVATE"
                        checked={testCase.visibility === "PRIVATE"}
                        onChange={(e) =>
                          updateTestCase(index, "visibility", e.target.value)
                        }
                        className="text-emerald-500"
                      />
                      <span className="text-sm text-gray-300 flex items-center gap-1">
                        <EyeOff size={14} />
                        Private
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {testCases.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>Chưa có test case nào</p>
              <p className="text-sm mt-1">Click "Thêm test case" để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
