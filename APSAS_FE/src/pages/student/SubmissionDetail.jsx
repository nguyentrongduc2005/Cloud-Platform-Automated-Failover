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
} from "lucide-react";
import Editor from "@monaco-editor/react";

export default function SubmissionDetail() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  // Mock submission data
  const submission = {
    id: submissionId,
    assignmentTitle: "Implement Singly Linked List",
    studentName: "Nguyễn Văn A",
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
    testCases: [
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
      {
        id: 4,
        input: "[1]",
        expectedOutput: "1 -> null",
        actualOutput: "1 -> null",
        passed: true,
      },
      {
        id: 5,
        input: "[100, 200]",
        expectedOutput: "100 -> 200 -> null",
        actualOutput: "100 -> 200",
        passed: false,
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
    lecturerFeedback: {
      comment:
        "Bài làm tốt! Em đã nắm vững các thao tác cơ bản trên Linked List. Tuy nhiên, em cần chú ý thêm về việc xử lý exception và tối ưu code. Hãy tham khảo feedback của AI để cải thiện code nhé.",
      rating: 4.5,
      createdAt: "2024-11-15 16:45:00",
    },
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

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-[1920px] mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-2"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold">{submission.assignmentTitle}</h1>
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
              <div className="flex items-center gap-2">
                <User className="text-emerald-400" size={20} />
                <h2 className="text-lg font-semibold text-white">
                  Feedback Giảng viên
                </h2>
              </div>

              {submission.lecturerFeedback ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= submission.lecturerFeedback.rating
                              ? "text-yellow-400"
                              : "text-gray-600"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">
                      {submission.lecturerFeedback.rating}/5.0
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed">
                    {submission.lecturerFeedback.comment}
                  </p>

                  <p className="text-xs text-gray-500">
                    Đánh giá lúc: {submission.lecturerFeedback.createdAt}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Giảng viên chưa đánh giá</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Cases Section */}
        <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Public Test Cases
            </h2>
            <span className="text-sm text-gray-400">
              {submission.testCases.filter((tc) => tc.passed).length}/
              {submission.testCases.length} passed
            </span>
          </div>

          <div className="space-y-3">
            {submission.testCases.map((testCase) => (
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
                    <p className="text-xs text-gray-400 mb-1">Actual Output:</p>
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
  );
}
