import api from "./api.js";

const mockCourse = {
  title: "Cấu trúc dữ liệu nâng cao",
  instructor: "TS. Nguyễn Văn A",
  progress: 65,
};

const mockAssignments = [
  {
    id: "linked-list",
    title: "Implement Singly Linked List",
    dueDate: "2024-10-15",
    status: "completed",
    score: 95,
    estimatedTime: "3 giờ",
    attempt: "2 / 3 lần nộp",
    weight: "15% tổng điểm",
    languages: ["cpp", "java", "python"],
    defaultLanguage: "cpp",
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int x) : val(x), next(nullptr) {}
};

class SinglyLinkedList {
public:
    SinglyLinkedList() : head(nullptr) {}

    void insertHead(int value) {
        // TODO: implement
    }

    // add more methods...
};

int main() {
    SinglyLinkedList list;
    // TODO: Write your tests
    return 0;
}
`,
      java: `class SinglyLinkedList {
    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    private Node head;

    public void insertHead(int value) {
        // TODO
    }
}

public class Main {
    public static void main(String[] args) {
        // TODO
    }
}
`,
      python: `class Node:
    def __init__(self, val, nxt=None):
        self.val = val
        self.next = nxt


class SinglyLinkedList:
    def __init__(self):
        self.head = None

    def insert_head(self, value):
        # TODO
        pass


if __name__ == "__main__":
    ll = SinglyLinkedList()
    # TODO
`,
    },
    promptHtml: `
      <p>Xây dựng lớp <strong>SinglyLinkedList</strong> hỗ trợ các thao tác cơ bản: <code>insertHead</code>, <code>insertTail</code>, <code>deleteValue</code>, <code>reverse</code> và <code>print</code>.</p>
      <ul>
        <li>Giữ độ phức tạp tối ưu: chèn đầu đuôi O(1), xóa giá trị O(n).</li>
        <li>Không sử dụng thư viện LinkedList có sẵn.</li>
        <li>Trình bày tối thiểu 5 test mô phỏng use case thực tế.</li>
      </ul>
      <p>Trình soạn thảo bên phải đã kèm mã khởi tạo. Hãy viết và chạy test ngay trên web.</p>
    `,
    constraints: [
      "0 ≤ số thao tác ≤ 10^5",
      "Giá trị node nằm trong [-10^9, 10^9]",
      "Không được rò rỉ bộ nhớ (C++/Java)",
    ],
    samples: [
      {
        id: "s1",
        input: ["insertHead 3", "insertTail 5", "reverse", "print"],
        output: "5 3",
        explanation: "Sau khi đảo, danh sách trở thành 5 -> 3.",
      },
    ],
    testCases: [
      {
        id: "tc1",
        label: "Basic operations",
        status: "passed",
        runtime: "30ms",
      },
      {
        id: "tc2",
        label: "Delete head/tail",
        status: "passed",
        runtime: "38ms",
      },
      {
        id: "tc3",
        label: "Reverse long list",
        status: "passed",
        runtime: "42ms",
      },
    ],
    submission: {
      status: "graded",
      submittedAt: "2024-10-12 21:35",
      reviewedAt: "2024-10-13 09:10",
      grade: 95,
      feedback:
        "Triển khai đầy đủ, xử lý tốt edge case. Có thể tối ưu thêm hàm reverse bằng cách tái sử dụng biến current.",
      reviewer: "TS. Nguyễn Văn A",
      runtime: "42 ms",
      memory: "7.2 MB",
      history: [
        {
          id: "h1",
          label: "Lần nộp #1",
          timestamp: "2024-10-10 20:15",
          note: "Thiếu reverse, yêu cầu bổ sung.",
        },
        {
          id: "h2",
          label: "Lần nộp #2",
          timestamp: "2024-10-12 21:35",
          note: "Đã chấm điểm, đạt 95%.",
        },
      ],
    },
  },
  {
    id: "stack-array",
    title: "Stack với Array và Linked List",
    dueDate: "2024-10-18",
    status: "in-progress",
    score: null,
    estimatedTime: "2.5 giờ",
    attempt: "1 / 3 lần nộp",
    weight: "10% tổng điểm",
    promptHtml: `
      <p>Triển khai hai phiên bản Stack: dựa trên Array động và dựa trên Linked List.</p>
      <ol>
        <li>So sánh ưu/nhược điểm về bộ nhớ và độ phức tạp.</li>
        <li>Viết hàm benchmark đẩy 1 triệu phần tử cho mỗi phiên bản.</li>
        <li>Ghi nhận kết quả ở dạng bảng HTML.</li>
      </ol>
    `,
    languages: ["cpp", "java", "python"],
    defaultLanguage: "python",
    starterCode: {
      cpp: "// TODO: stack implementation for array vs linked list",
      java: "// TODO: stack implementation in Java",
      python: "# TODO: stack implementation in Python",
    },
    resources: [
      {
        id: "note",
        label: "Ghi chú buổi học Stack",
        type: "DOCX, 180KB",
        href: "#",
      },
      {
        id: "snippet",
        label: "Snippet tạo benchmark",
        type: "JS, 1KB",
        href: "#",
      },
    ],
    samples: [],
    testCases: [
      { id: "tc1", label: "Push/Pop 1e6 phần tử", status: "pending" },
      { id: "tc2", label: "So sánh memory footprint", status: "pending" },
    ],
    submission: {
      status: "draft",
      submittedAt: "Chưa nộp",
      reviewedAt: null,
      grade: null,
      feedback: null,
      reviewer: null,
      history: [
        {
          id: "h1",
          label: "Tạo bản nháp",
          timestamp: "2024-10-14 19:12",
          note: "Đang viết phần benchmark.",
        },
      ],
    },
  },
  {
    id: "bst-ops",
    title: "BST Operations",
    dueDate: "2024-10-22",
    status: "not-started",
    score: null,
    estimatedTime: "4 giờ",
    attempt: "0 / 3 lần nộp",
    weight: "20% tổng điểm",
    promptHtml: `
      <p>Hoàn thiện các thao tác của Binary Search Tree: insert, delete, search, inorder, preorder, postorder.</p>
      <p>Xây dựng thêm chức năng tối ưu cây bằng cách cân bằng lại dựa trên chiều cao.</p>
      <p>Viết báo cáo mô tả chiến lược cân bằng và phân tích độ phức tạp.</p>
    `,
    languages: ["cpp"],
    defaultLanguage: "cpp",
    starterCode: {
      cpp: "// TODO: implement BST operations",
    },
    resources: [
      {
        id: "paper",
        label: "Tài liệu AVL Tree tham khảo",
        type: "PDF, 950KB",
        href: "#",
      },
    ],
    samples: [],
    testCases: [
      { id: "tc1", label: "Insert/Delete random", status: "locked" },
    ],
    submission: {
      status: "pending",
      submittedAt: "Chưa nộp",
      reviewedAt: null,
      grade: null,
      feedback: null,
      reviewer: null,
      history: [],
    },
  },
];

export async function getStudentAssignments() {
  try {
    const response = await api.get("/student/assignments");
    return response.data;
  } catch (error) {
    console.warn(
      "[assignmentService] FALLBACK MOCK DATA - Thay bằng API thật khi sẵn sàng."
    );
    return { course: mockCourse, assignments: mockAssignments };
  }
}

export async function getStudentAssignmentDetail(assignmentId) {
  if (!assignmentId) {
    throw new Error("assignmentId is required");
  }

  try {
    const response = await api.get(`/student/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.warn(
      "[assignmentService] FALLBACK MOCK DETAIL - Thay bằng API thật khi sẵn sàng."
    );
    const assignment =
      mockAssignments.find((item) => item.id === assignmentId) ??
      mockAssignments[0];

    if (!assignment) {
      throw error;
    }

    return { course: mockCourse, assignment };
  }
}

export async function runAssignmentCode(assignmentId, payload) {
  try {
    const response = await api.post(
      `/student/assignments/${assignmentId}/run`,
      payload
    );
    return response.data;
  } catch (error) {
    console.warn("[assignmentService] MOCK runAssignmentCode fallback");
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      stdout: "5 3",
      message: "Sample tests passed",
      testResults: [
        { id: "sample-1", label: "Sample #1", passed: true },
        { id: "sample-2", label: "Sample #2", passed: true },
      ],
    };
  }
}

export async function submitAssignmentCode(assignmentId, payload) {
  try {
    const response = await api.post(
      `/student/assignments/${assignmentId}/submit`,
      payload
    );
    return response.data;
  } catch (error) {
    console.warn("[assignmentService] MOCK submitAssignmentCode fallback");
    await new Promise((resolve) => setTimeout(resolve, 900));
    return {
      success: true,
      message: "Chúc mừng! Bạn đã nộp bài thành công, đang chấm điểm.",
    };
  }
}
