import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  AlertCircle,
  Sparkles,
  User,
  Lock,
  Unlock,
} from "lucide-react";
import Editor from "@monaco-editor/react";

export default function LecturerSubmissionDetail() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock submission data
  const submission = {
    id: submissionId,
    assignmentTitle: "Implement Singly Linked List",
    studentName: "Nguyễn Văn A",
    studentClass: "SE1801",
    studentAvatar: "https://i.pravatar.cc/150?img=1",
    submittedAt: "2024-11-15 14:30:25",
    language: "java",
    status: "passed", // passed, failed, pending
    score: 95,
    runtime: "142ms",
    memory: "38.5MB",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    testCasesPassed: 18,
    totalTestCases: 20,
    publicTestCases: [
      {
        id: 1,
        input: "[1, 2, 3]",
        expectedOutput: "1 -> 2 -> 3 -> null",
        actualOutput: "1 -> 2 -> 3 -> null",
        passed: true,
      },
      {
        id: 2,
        input: "[5, 10, 15, 20]",
        expectedOutput: "5 -> 10 -> 15 -> 20 -> null",
        actualOutput: "5 -> 10 -> 15 -> 20 -> null",
        passed: true,
      },
      {
        id: 3,
        input: "[]",
        expectedOutput: "null",
        actualOutput: "null",
        passed: true,
      },
    ],
    privateTestCases: [
      {
        id: 4,
        input: "[1]",
        expectedOutput: "1 -> null",
        actualOutput: "1 -> null",
        passed: true,
      },
      {
        id: 5,
        input: "[100, 200, 300, 400, 500]",
        expectedOutput: "100 -> 200 -> 300 -> 400 -> 500 -> null",
        actualOutput: "100 -> 200 -> 300 -> 400 -> 500 -> null",
        passed: true,
      },
      {
        id: 6,
        input: "[10, 20]",
        expectedOutput: "10 -> 20 -> null",
        actualOutput: "10 -> 20",
        passed: false,
      },
      {
        id: 7,
        input: "[7, 14, 21, 28]",
        expectedOutput: "7 -> 14 -> 21 -> 28 -> null",
        actualOutput: "7 -> 14 -> 21 -> 28 -> null",
        passed: true,
      },
    ],
    code: `public class LinkedList {
    private Node head;
    
    private static class Node {
        int data;
        Node next;
        
        Node(int data) {
            this.data = data;
            this.next = null;
        }
    }
    
    public void insertAtBeginning(int data) {
        Node newNode = new Node(data);
        newNode.next = head;
        head = newNode;
    }
    
    public void insertAtEnd(int data) {
        Node newNode = new Node(data);
        
        if (head == null) {
            head = newNode;
            return;
        }
        
        Node current = head;
        while (current.next != null) {
            current = current.next;
        }
        current.next = newNode;
    }
    
    public void delete(int data) {
        if (head == null) return;
        
        if (head.data == data) {
            head = head.next;
            return;
        }
        
        Node current = head;
        while (current.next != null && current.next.data != data) {
            current = current.next;
        }
        
        if (current.next != null) {
            current.next = current.next.next;
        }
    }
    
    public void display() {
        Node current = head;
        while (current != null) {
            System.out.print(current.data + " -> ");
            current = current.next;
        }
        System.out.println("null");
    }
}`,
    aiFeedback: {
      text: "Code của bạn đã implement đúng các phương thức cơ bản của Linked List với cấu trúc rõ ràng. Tuy nhiên, nên thêm null check cho tham số, tối ưu method delete bằng cách giảm số lần duyệt, và có thể thêm các method hỗ trợ như size() và search() để code hoàn thiện hơn.",
      suggestions: [
        "Nên thêm null check cho tham số data trong các phương thức insert để tránh NullPointerException",
        "Method delete có thể tối ưu bằng cách giảm số lần duyệt và trả về boolean để biết thao tác thành công hay không",
        "Nên thêm method size() để biết số phần tử trong danh sách",
        "Có thể thêm method search() để tìm kiếm phần tử trong danh sách",
        "Nên thêm validation cho input và xử lý các edge case tốt hơn",
      ],
    },
    lecturerFeedback: null, // Will be added by lecturer
  };

  const getStatusBadge = () => {
    if (submission.status === "passed") {
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        icon: <CheckCircle2 size={16} />,
        label: "PASSED",
      };
    } else if (submission.status === "failed") {
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        icon: <AlertCircle size={16} />,
        label: "FAILED",
      };
    } else {
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-400",
        icon: <Clock size={16} />,
        label: "PENDING",
      };
    }
  };

  const statusBadge = getStatusBadge();

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim()) {
      alert("Vui lòng nhập feedback");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to submit feedback
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Feedback đã được gửi thành công!");
      setShowFeedbackForm(false);
      setFeedbackComment("");
      // Refresh data here
    } catch (error) {
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-[1920px] mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold">{submission.assignmentTitle}</h1>

            {/* Student Info */}
            <div className="flex items-center gap-3">
              <img
                src={submission.studentAvatar}
                alt={submission.studentName}
                className="w-10 h-10 rounded-full object-cover bg-[#0b0f12]"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  {submission.studentName}
                </p>
                <p className="text-xs text-gray-400">
                  {submission.studentClass}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              Nộp lúc: {submission.submittedAt}
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border ${statusBadge.bg} ${statusBadge.border} ${statusBadge.text}`}
          >
            {statusBadge.icon}
            {statusBadge.label}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Điểm</p>
                <p className="text-xl font-bold text-emerald-400">
                  {submission.score}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Runtime</p>
                <p className="text-xl font-bold text-white">
                  {submission.runtime}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Database size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Memory</p>
                <p className="text-xl font-bold text-white">
                  {submission.memory}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Cpu size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Test Cases</p>
                <p className="text-xl font-bold text-white">
                  {submission.testCasesPassed}/{submission.totalTestCases}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock size={20} className="text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Time Complexity</p>
                <p className="text-xl font-bold text-white">
                  {submission.timeComplexity}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Database size={20} className="text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Space Complexity</p>
                <p className="text-xl font-bold text-white">
                  {submission.spaceComplexity}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Code + Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Code Editor */}
          <div className="space-y-4">
            <div className="bg-[#0b0f12] border border-[#202934] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#202934] bg-[#0f1419]">
                <h2 className="text-lg font-semibold text-white">
                  Code đã nộp
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Ngôn ngữ:{" "}
                  {submission.language === "java"
                    ? "Java"
                    : submission.language === "python"
                    ? "Python"
                    : submission.language === "javascript"
                    ? "JavaScript"
                    : "C++"}
                </p>
              </div>
              <div className="h-[600px]">
                <Editor
                  height="100%"
                  language={submission.language}
                  value={submission.code}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Feedback */}
          <div className="space-y-4">
            {/* AI Feedback */}
            <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-400" size={20} />
                <h2 className="text-lg font-semibold text-white">
                  AI Feedback
                </h2>
              </div>

              <div className="space-y-4">
                {/* Feedback Text */}
                <div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {submission.aiFeedback.text}
                  </p>
                </div>

                {/* Suggestions */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-3">
                    Gợi ý cải thiện
                  </h3>
                  <ul className="space-y-2">
                    {submission.aiFeedback.suggestions.map(
                      (suggestion, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-400 flex items-start gap-2"
                        >
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lecturer Feedback */}
            <div className="bg-[#0b0f12] border border-[#202934] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="text-emerald-400" size={20} />
                  <h2 className="text-lg font-semibold text-white">
                    Feedback của bạn
                  </h2>
                </div>
                {!showFeedbackForm && !submission.lecturerFeedback && (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-medium transition"
                  >
                    Thêm feedback
                  </button>
                )}
              </div>

              {showFeedbackForm ? (
                <div className="space-y-4">
                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nhận xét <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Nhập nhận xét của bạn về bài làm của học sinh..."
                      rows={8}
                      className="w-full bg-[#0f1419] border border-[#202934] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowFeedbackForm(false);
                        setFeedbackComment("");
                      }}
                      className="px-4 py-2 rounded-lg border border-[#202934] text-gray-300 hover:text-white hover:border-gray-600 transition"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={isSubmitting || !feedbackComment.trim()}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Đang gửi..." : "Gửi feedback"}
                    </button>
                  </div>
                </div>
              ) : submission.lecturerFeedback ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {submission.lecturerFeedback.comment}
                  </p>

                  <p className="text-xs text-gray-500">
                    Đánh giá lúc: {submission.lecturerFeedback.createdAt}
                  </p>

                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Chỉnh sửa feedback
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có feedback</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Cases Section */}
        <div className="space-y-6">
          {/* Public Test Cases */}
          <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Unlock size={20} className="text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">
                  Public Test Cases
                </h2>
              </div>
              <span className="text-sm text-gray-400">
                {submission.publicTestCases.filter((tc) => tc.passed).length}/
                {submission.publicTestCases.length} passed
              </span>
            </div>

            <div className="space-y-3">
              {submission.publicTestCases.map((testCase) => (
                <div
                  key={testCase.id}
                  className={`bg-[#0b0f12] border rounded-lg p-4 ${
                    testCase.passed
                      ? "border-emerald-500/30"
                      : "border-red-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        Test Case #{testCase.id}
                      </span>
                      {testCase.passed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <AlertCircle size={12} />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Input:</p>
                      <code className="block text-sm text-gray-300 bg-black/30 px-3 py-2 rounded">
                        {testCase.input}
                      </code>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Expected Output:
                      </p>
                      <code className="block text-sm text-gray-300 bg-black/30 px-3 py-2 rounded">
                        {testCase.expectedOutput}
                      </code>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Actual Output:
                      </p>
                      <code
                        className={`block text-sm px-3 py-2 rounded ${
                          testCase.passed
                            ? "text-emerald-300 bg-emerald-500/10"
                            : "text-red-300 bg-red-500/10"
                        }`}
                      >
                        {testCase.actualOutput}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Private Test Cases */}
          <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-amber-400" />
                <h2 className="text-lg font-semibold text-white">
                  Private Test Cases
                </h2>
                <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                  Chỉ giảng viên xem được
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {submission.privateTestCases.filter((tc) => tc.passed).length}/
                {submission.privateTestCases.length} passed
              </span>
            </div>

            <div className="space-y-3">
              {submission.privateTestCases.map((testCase) => (
                <div
                  key={testCase.id}
                  className={`bg-[#0b0f12] border rounded-lg p-4 ${
                    testCase.passed
                      ? "border-emerald-500/30"
                      : "border-red-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        Test Case #{testCase.id}
                      </span>
                      {testCase.passed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <AlertCircle size={12} />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Input:</p>
                      <code className="block text-sm text-gray-300 bg-black/30 px-3 py-2 rounded">
                        {testCase.input}
                      </code>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Expected Output:
                      </p>
                      <code className="block text-sm text-gray-300 bg-black/30 px-3 py-2 rounded">
                        {testCase.expectedOutput}
                      </code>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Actual Output:
                      </p>
                      <code
                        className={`block text-sm px-3 py-2 rounded ${
                          testCase.passed
                            ? "text-emerald-300 bg-emerald-500/10"
                            : "text-red-300 bg-red-500/10"
                        }`}
                      >
                        {testCase.actualOutput}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
