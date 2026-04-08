export const studentCourseModules = {
  default: [
    {
      id: "lesson-1",
      type: "lesson",
      title: "Giới thiệu Linked List",
      duration: "15 phút",
      status: "completed",
      summary: "Nắm các khái niệm cơ bản của danh sách liên kết và cách thao tác từng nút.",
      content: [
        "Linked List là cấu trúc dữ liệu tuyến tính trong đó các phần tử được liên kết thông qua con trỏ.",
        "Bài học cung cấp so sánh giữa mảng và danh sách liên kết, trường hợp sử dụng và đánh đổi về bộ nhớ.",
      ],
      videoUrl: "https://player.vimeo.com/video/76979871?h=8272103f6e",
      resources: [
        { id: "res-1", label: "Slides bài giảng", type: "PDF", size: "2.3MB" },
        { id: "res-2", label: "Mã tham khảo", type: "ZIP", size: "4.1MB" },
      ],
    },
    {
      id: "assignment-1",
      type: "assignment",
      title: "Bài tập: Implement Singly Linked List",
      deadline: "2024-10-15",
      status: "review",
      summary: "Cài đặt đầy đủ các thao tác căn bản với singly linked list.",
      assignmentId: "assignment-1",
      content: [
        "Tạo cấu trúc Node và LinkedList bằng JavaScript.",
        "Hỗ trợ các thao tác insert, delete, find và reverse.",
      ],
    },
    {
      id: "lesson-2",
      type: "lesson",
      title: "Stack và Queue",
      duration: "20 phút",
      status: "locked",
      summary: "Phân biệt hai cấu trúc LIFO & FIFO cùng các tình huống áp dụng.",
      content: [
        "Stack được dùng cho undo/redo, call stack.",
        "Queue phù hợp cho xử lý task hoặc BFS.",
      ],
      videoUrl: "https://player.vimeo.com/video/137857207",
      resources: [
        { id: "res-3", label: "Sơ đồ hoạt động", type: "PNG", size: "820KB" },
      ],
    },
  ],
};

export const getModulesForCourse = (courseId) => {
  return studentCourseModules[courseId] ?? studentCourseModules.default;
};

export const getModuleDetail = (courseId, moduleId) => {
  const modules = getModulesForCourse(courseId);
  return modules.find((module) => module.id === moduleId);
};
