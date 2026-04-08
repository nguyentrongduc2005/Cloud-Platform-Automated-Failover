import api from "./api";

/**
 * Service for handling course-related operations
 */
const courseService = {
  /**
   * --- PUBLIC COURSE APIs ---
   * 1. Lấy danh sách khóa public
   * 2. Lấy chi tiết trước khi đăng ký
   * 3. Đăng ký khóa học public
   */

  // (1) Lấy danh sách khóa public
  getPublicCourses: async ({ page = 0, size = 10, search = "" } = {}) => {
    try {
      const response = await api.get("/courses", {
        params: { page, size, search },
      });
      // BE trả: { code, message, data: { content, totalPages, ... } }
      return response.data; // giữ nguyên, lát nữa xử lý ở component
    } catch (error) {
      console.error("Error fetching public courses:", error);
      throw error;
    }
  },

  // (2) Lấy chi tiết khóa học trước khi đăng ký
  getCourseRegisterDetails: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/register-details`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course register details:", error);
      throw error;
    }
  },

  // (3) Đăng ký khóa public
  joinPublicCourse: async ({ courseId, code }) => {
    try {
      const payload = { courseId, code };
      const response = await api.post("/courses/join", payload);
      return response.data;
    } catch (error) {
      console.error("Error joining course:", error);
      throw error;
    }
  },

  /**
   * Get course detail for student
   * @param {string} courseId - The course ID
   * @returns {Promise} Course detail data
   */
  getStudentCourseDetail: async (courseId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/student/courses/${courseId}`);
      // return response.data;

      // Mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: courseId,
            title: "Cấu trúc dữ liệu nâng cao",
            instructor: "TS. Nguyễn Văn A",
            thumbnail:
              "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=450&fit=crop",
            totalLessons: 13,
            totalAssignments: 8,
            progress: 65,
            avgProgress: 58,
            totalStudents: 120,
            lastUpdated: "12/10/2024",
            description:
              "Khóa học bao gồm các cấu trúc dữ liệu nâng cao, bài giảng minh họa và hệ thống bài tập thực hành theo phong cách phỏng vấn.",
            modules: [
              {
                id: "lesson-1",
                title: "Giới thiệu Linked List",
                duration: "15 phút",
                imageCount: 8,
                type: "content",
                status: "completed",
              },
              {
                id: "assignment-1",
                title: "Bài tập: Implement Singly Linked List",
                deadline: "2024-10-15",
                type: "assignment",
                status: "review",
              },
              {
                id: "lesson-2",
                title: "Stack và Queue",
                duration: "20 phút",
                imageCount: 12,
                type: "content",
                status: "in-progress",
              },
              {
                id: "lesson-3",
                title: "Cấu trúc dữ liệu Tree",
                duration: "25 phút",
                imageCount: 15,
                type: "content",
                status: "locked",
              },
              {
                id: "assignment-2",
                title: "Stack và Queue",
                deadline: "2024-10-20",
                type: "assignment",
                status: "not-started",
              },
            ],
          });
        }, 500);
      });
    } catch (error) {
      console.error("Error fetching student course detail:", error);
      throw error;
    }
  },

  /**
   * Get course detail for lecturer
   * @param {string} courseId - The course ID
   * @returns {Promise} Course detail data
   */
  getLecturerCourseDetail: async (courseId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/lecturer/courses/${courseId}`);
      // return response.data;

      // Mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: courseId,
            title: "Java Programming Fundamentals",
            description:
              "Khóa học lập trình Java từ cơ bản đến nâng cao, bao gồm OOP, Collections, Exception Handling và nhiều chủ đề khác.",
            instructor: "Trần Minh Khôi",
            thumbnail:
              "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop",
            totalStudents: 45,
            totalLessons: 13,
            totalAssignments: 8,
            progress: 85,
            avgProgress: 72,
            avgRating: 4.8,
            totalReviews: 32,
            createdAt: "2024-01-15",
            lastUpdated: "2024-11-01",
            modules: [
              {
                id: 1,
                type: "content",
                title: "Introduction to Java",
                duration: "45 phút",
                imageCount: 5,
              },
              {
                id: 2,
                type: "content",
                title: "Variables and Data Types",
                duration: "60 phút",
                imageCount: 8,
              },
              {
                id: 3,
                type: "assignment",
                title: "Lab 1: Basic Java Programming",
                deadline: "2024-03-20",
              },
              {
                id: 4,
                type: "content",
                title: "Control Flow Statements",
                duration: "50 phút",
                imageCount: 6,
              },
              {
                id: 5,
                type: "assignment",
                title: "Lab 2: Control Structures",
                deadline: "2024-03-25",
              },
              {
                id: 6,
                type: "content",
                title: "Object-Oriented Programming",
                duration: "90 phút",
                imageCount: 12,
              },
            ],
          });
        }, 500);
      });
    } catch (error) {
      console.error("Error fetching lecturer course detail:", error);
      throw error;
    }
  },

  /**
   * Get all courses for student
   * @returns {Promise} List of enrolled courses
   */
  getStudentCourses: async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/student/courses');
      // return response.data;

      // Mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              title: "Java Programming Fundamentals",
              instructor: "TS. Trần Minh Quân",
              instructorAvatar: "/images/avatar-lecturer1.png",
              thumbnail: "/images/course-java.png",
              language: "Public",
              studentCount: 45,
              lessonCount: 13,
              duration: 18,
              progress: 65,
              lastAccessed: "2 days ago",
            },
            {
              id: 2,
              title: "Web Development with React",
              instructor: "TS. Nguyễn Văn A",
              instructorAvatar: "/images/avatar-lecturer2.png",
              thumbnail: "/images/course-react.png",
              language: "Public",
              studentCount: 120,
              lessonCount: 24,
              duration: 32,
              progress: 30,
              lastAccessed: "5 days ago",
            },
            {
              id: 3,
              title: "Python for Data Science",
              instructor: "TS. Lê Văn C",
              instructorAvatar: "/images/avatar-lecturer3.png",
              thumbnail: "/images/course-python.png",
              language: "Public",
              studentCount: 89,
              lessonCount: 18,
              duration: 24,
              progress: 90,
              lastAccessed: "1 day ago",
            },
          ]);
        }, 400);
      });
    } catch (error) {
      console.error("Error fetching student courses:", error);
      throw error;
    }
  },

  /**
   * Get all courses for lecturer
   * @returns {Promise} List of lecturer courses
   */
  getLecturerCourses: async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/lecturer/courses');
      // return response.data;

      // Mock data - reuse from existing
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              title: "Java Programming Fundamentals",
              thumbnail: "/images/course-java.png",
              studentCount: 45,
              lessonCount: 13,
              assignmentCount: 8,
              progress: 85,
              lastUpdated: "2024-11-01",
            },
            {
              id: 2,
              title: "Advanced Data Structures",
              thumbnail: "/images/course-ds.png",
              studentCount: 32,
              lessonCount: 20,
              assignmentCount: 12,
              progress: 65,
              lastUpdated: "2024-10-28",
            },
          ]);
        }, 400);
      });
    } catch (error) {
      console.error("Error fetching lecturer courses:", error);
      throw error;
    }
  },

  /**
   * Join a course with course code
   * @param {string} courseCode - The course code
   * @returns {Promise} Join result
   */
  joinCourse: async (courseCode) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.post('/student/courses/join', { courseCode });
      // return response.data;

      // Mock data
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (courseCode && courseCode.trim()) {
            resolve({
              success: true,
              message: "Tham gia khóa học thành công!",
              courseId: Math.floor(Math.random() * 1000),
            });
          } else {
            reject(new Error("Mã khóa học không hợp lệ"));
          }
        }, 1000);
      });
    } catch (error) {
      console.error("Error joining course:", error);
      throw error;
    }
  },

  /**
   * Submit help request for a course (Student)
   * API: POST /api/help-requests/course/{courseId}
   * Request body: { title: string, body: string }
   * Response: ApiResponse { code, message, data }
   * 
   * @param {string|number} courseId - The course ID
   * @param {object} requestData - Help request data { title, body }
   * @returns {Promise} Request result
   */
  submitHelpRequest: async (courseId, requestData) => {
    try {
      const response = await api.post(`/help-requests/course/${courseId}`, {
        title: requestData.title || requestData.subject || "Yêu cầu hỗ trợ",
        body: requestData.body || requestData.content || requestData.message
      });
      
      const apiRes = response.data; // ApiResponse format: { code, message, data }
      
      // Unwrap ApiResponse
      if (apiRes.code === "ok" || apiRes.code === "0" || apiRes.code === "OK") {
        return {
          success: true,
          message: apiRes.message || "Yêu cầu hỗ trợ đã được gửi thành công!",
          data: apiRes.data
        };
      }
      
      throw new Error(apiRes.message || "Không thể tạo help request");
    } catch (error) {
      console.error("Error submitting help request:", error);
      
      // Handle specific error codes
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorCode = errorData.code;
        const errorMessage = errorData.message;
        
        switch (errorCode) {
          case "E4000":
            throw new Error("Request không hợp lệ. Vui lòng kiểm tra lại title và body.");
          case "E4010":
            throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.");
          case "E5001":
            throw new Error("Bạn không có quyền REQUEST_HELP để tạo help request.");
          case "E5002":
            throw new Error("Không tìm thấy course hoặc bạn chưa đăng ký khóa học này.");
          default:
            throw new Error(errorMessage || "Có lỗi xảy ra khi tạo help request");
        }
      }
      
      if (error.response?.status === 403) {
        throw new Error("Bạn chưa đăng ký khóa học này hoặc không có quyền tạo help request.");
      }
      
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy course.");
      }
      
      const errorMessage = error.message || "Có lỗi xảy ra khi tạo help request. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },

  /**
   * Get help requests for a course (Lecturer)
   * API: GET /api/help-requests/teacher/course/{courseId}?page=1&limit=20
   * Response: { data: [...], pagination: {...} }
   * 
   * @param {string|number} courseId - The course ID
   * @param {object} options - Pagination options { page, limit }
   * @returns {Promise} List of help requests with pagination
   */
  getHelpRequests: async (courseId, options = {}) => {
    try {
      const { page = 1, limit = 20 } = options;
      const response = await api.get(`/help-requests/teacher/course/${courseId}`, {
        params: { page, limit }
      });
      
      // API trả về format: { data: [...], pagination: {...} }
      // Không có ApiResponse wrapper
      const result = response.data;
      
      console.log('getHelpRequests API response:', result);
      
      // Map API response to component format
      // API trả về: { id, studentId, studentName, studentEmail, courseId, title, body, createdAt }
      // Component cần: { id, studentName, studentAvatar, content, createdAt, status }
      if (result && result.data && Array.isArray(result.data)) {
        const mappedRequests = result.data.map(request => ({
          id: request.id,
          studentId: request.studentId,
          studentName: request.studentName || 'N/A',
          studentEmail: request.studentEmail || '',
          studentAvatar: `https://i.pravatar.cc/150?img=${request.studentId || 1}`, // Generate avatar from studentId
          content: request.body || request.content || '',
          title: request.title || '',
          createdAt: request.createdAt,
          status: request.status || "pending" // API có thể không trả về status
        }));
        
        return {
          data: mappedRequests,
          pagination: result.pagination || {}
        };
      }
      
      // Fallback: return empty if unexpected format
      return {
        data: [],
        pagination: {}
      };
    } catch (error) {
      console.error("Error fetching help requests:", error);
      
      // Handle specific error codes
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorCode = errorData.code;
        const errorMessage = errorData.message;
        
        switch (errorCode) {
          case "E4000":
            throw new Error("Request không hợp lệ. Vui lòng kiểm tra lại courseId.");
          case "E4010":
            throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.");
          case "E5001":
            throw new Error("Bạn không có quyền VIEW_HELP_REQUESTS để xem help requests.");
          case "E5002":
            throw new Error("Không tìm thấy course.");
          default:
            throw new Error(errorMessage || "Có lỗi xảy ra khi tải help requests");
        }
      }
      
      if (error.response?.status === 403) {
        throw new Error("Bạn không có quyền xem help requests của course này.");
      }
      
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy course.");
      }
      
      const errorMessage = error.message || "Có lỗi xảy ra khi tải help requests. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  },
};

export default courseService;
