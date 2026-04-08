export const lecturerCourseSummary = {
  title: "Cấu trúc dữ liệu nâng cao",
  instructor: "TS. Nguyễn Văn A",
  progress: 65,
  totalStudents: 40,
  totalLessons: "15/23",
  avgProgress: 65,
};

export const lecturerAssignments = [
  {
    id: "linked-list",
    title: "Implement Singly Linked List",
    deadline: "2024-10-15",
    status: "completed",
    statusLabel: "Đã hoàn thành",
    submitted: 38,
    total: 40,
    avgScore: 95,
    progress: 95,
    description: `
      <p>Xây dựng lớp <strong>SinglyLinkedList</strong> hỗ trợ các thao tác: <code>insertHead</code>, <code>insertTail</code>, <code>deleteValue</code>, <code>reverse</code> và <code>print</code>.</p>
      <ul>
        <li>Tối ưu độ phức tạp, đảm bảo không rò rỉ bộ nhớ.</li>
        <li>Định nghĩa test case minh họa và mô tả rõ ràng trong phần báo cáo.</li>
        <li>Đính kèm kết quả benchmark so sánh với Vector.</li>
      </ul>
    `,
    resources: [
      { id: "slide", label: "Slide chương 3 - Linked List", type: "PDF • 2.1MB" },
      { id: "sample", label: "Test runner mẫu", type: "ZIP • 56KB" },
    ],
    students: [
      {
        id: "st1",
        name: "Nguyễn Thị Lan",
        avatar: "/images/avatar-01.png",
        class: "SE-2001",
        status: "graded",
        score: 100,
        submissionsCount: 2,
        lastSubmitted: "2024-10-12 21:35",
        bestScore: 100,
        avgRuntime: "41 ms",
        note: "Triển khai tốt, có thể chia sẻ giải pháp với lớp.",
        timeline: [
          { label: "Lần nộp #1", time: "2024-10-10 09:12", message: "Thiếu reverse()" },
          { label: "Lần nộp #2", time: "2024-10-12 21:35", message: "Hoàn chỉnh, đạt 100%" },
        ],
      },
      {
        id: "st2",
        name: "Trần Hoàng Minh",
        avatar: "/images/avatar-02.png",
        class: "SE-2001",
        status: "pending",
        score: 78,
        submissionsCount: 1,
        lastSubmitted: "2024-10-13 08:20",
        bestScore: 78,
        avgRuntime: "65 ms",
        note: "Thiếu phần benchmark, cần bổ sung trước hạn.",
        timeline: [
          { label: "Lần nộp #1", time: "2024-10-13 08:20", message: "Đạt 78%" },
        ],
      },
      {
        id: "st3",
        name: "Lê Gia Bảo",
        avatar: "/images/avatar-03.png",
        class: "SE-2002",
        status: "missing",
        score: null,
        submissionsCount: 0,
        lastSubmitted: "Chưa nộp",
        bestScore: null,
        avgRuntime: "--",
        note: "Nhắc sinh viên nộp bài trước ngày 14/10.",
        timeline: [],
      },
    ],
  },
  {
    id: "stack-array",
    title: "Stack với Array và Linked List",
    deadline: "2024-10-18",
    status: "in-progress",
    statusLabel: "Đang làm",
    submitted: 25,
    total: 40,
    avgScore: 78,
    progress: 62,
    description: `
      <p>Triển khai hai phiên bản Stack: dựa trên Array động và dựa trên Linked List.</p>
      <ol>
        <li>So sánh ưu/nhược điểm về bộ nhớ.</li>
        <li>Benchmark đẩy 1 triệu phần tử cho mỗi phiên bản.</li>
        <li>Ghi nhận kết quả ở dạng bảng HTML.</li>
      </ol>
    `,
    resources: [
      { id: "doc", label: "Ghi chú buổi học Stack", type: "DOCX • 180KB" },
      { id: "snippet", label: "Snippet benchmark", type: "JS • 1KB" },
    ],
    students: [],
  },
  {
    id: "bst-ops",
    title: "BST Operations",
    deadline: "2024-10-22",
    status: "not-started",
    statusLabel: "Chưa bắt đầu",
    submitted: 0,
    total: 40,
    avgScore: null,
    progress: 0,
    description: `
      <p>Hoàn thiện các thao tác của Binary Search Tree: insert, delete, search, inorder, preorder, postorder.</p>
      <p>Bổ sung cơ chế cân bằng lại cây dựa trên chiều cao và phân tích độ phức tạp.</p>
    `,
    resources: [{ id: "paper", label: "Tài liệu AVL tham khảo", type: "PDF • 950KB" }],
    students: [],
  },
];
