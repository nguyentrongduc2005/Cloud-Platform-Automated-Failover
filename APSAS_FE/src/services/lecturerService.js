import api from "./api";

// Service cho Lecturer Resources và Courses
const lecturerService = {
  // Inject api instance
  api,
  /**
   * Lấy danh sách khóa học của giảng viên
   * @param {Object} params - Query parameters
   * @param {number} params.page - Số trang (0-indexed for API)
   * @param {number} params.size - Kích thước trang
   * @param {string} params.search - Từ khóa tìm kiếm
   * @returns {Promise} API response
   */
  async getMyCourses(params = {}) {
    try {
      const { page = 0, size = 6, search = '' } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (search) {
        queryParams.append('search', search);
      }

      const response = await api.get(`/courses/lecture/my-courses?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecturer courses:', error);
      throw error;
    }
  },

  /**
   * Lấy thống kê tổng quan của giảng viên
   * @returns {Promise} API response
   */
  async getStats() {
    try {
      const response = await api.get('/teacher/stats/total-students');
      return response.data;
    } catch (error) {
      console.error('Error fetching lecturer stats:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách resources của giảng viên
   * @param {Object} params - Query parameters
   * @param {number} params.page - Số trang (0-indexed for API)
   * @param {number} params.size - Kích thước trang
   * @param {string} params.search - Từ khóa tìm kiếm
   * @returns {Promise} API response
   */
  async getResources(params = {}) {
    try {
      const { page = 1, limit = 10, keyword = "" } = params;

      const res = await api.get("/tutorials", {
        params: {
          page: page - 1,
          size: limit,
          search: keyword || undefined,
        },
      });

      const data = res.data?.data || {};
      const content = data.content || [];

      const mappedResources = content.map((tut) => ({
        id: tut.id,
        title: tut.title,
        description: tut.summary,
        createdBy: tut.creatorName || `User #${tut.createdBy}`,
        contentCount: tut.lessonCount ?? 0,
        exerciseCount: tut.assignmentCount ?? 0,
        imageCount: tut.totalImages ?? 0,
        createdAt: tut.createdAt?.substring(0, 10) || "",
        type: "VIDEO",
      }));

      return {
        data: mappedResources,
        pagination: {
          page,
          limit,
          total: data.totalElements ?? mappedResources.length,
          totalPages: data.totalPages ?? 1,
        },
      };
    } catch (error) {
      console.error("Error fetching lecturer resources:", error);
      throw error;
    }
  },


  /**
   * Lấy chi tiết tutorial để áp dụng vào khóa học
   * @param {string|number} tutorialId - ID của tutorial
   * @returns {Promise} API response
   */
  async getTutorialDetail(tutorialId) {
    try {
      const response = await api.get(`/tutorials/${tutorialId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tutorial detail:', error);
      throw error;
    }
  },

  /**
   * Tạo khóa học mới từ tutorial
   * @param {Object} courseData - Dữ liệu khóa học
   * @returns {Promise} API response
   */
  async createCourse(courseData) {
    try {
      const response = await api.post('/courses/create', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  /**
   * Upload avatar cho khóa học
   * @param {string|number} courseId - ID của khóa học
   * @param {File} file - File ảnh để upload
   * @returns {Promise} API response
   */
  async uploadCourseAvatar(courseId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/courses/${courseId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading course avatar:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách assignments theo courseId
   * @param {string|number} courseId - ID của khóa học
   * @returns {Promise} API response
   */
  async getCourseAssignments(courseId) {
    try {
      const response = await api.get(`/assignment/${courseId}/assignments`);
      return response.data;
    } catch (error) {
      console.error('Error getting course assignments:', error);
      throw error;
    }
  },

  // Get course overview for teacher
  async getCourseOverview(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/teacher-overview`);
      return response.data;
    } catch (error) {
      console.error('Error getting course overview:', error);
      throw error;
    }
  },

  // Get content detail
  async getContentDetail(contentId) {
    try {
      const response = await api.get(`/tutorials/contents/${contentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting content detail:', error);
      throw error;
    }
  },

  // Get assignment detail
  async getAssignmentDetail(courseId, assignmentId) {
    try {
      const response = await api.get(`/assignment/${courseId}/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting assignment detail:', error);
      throw error;
    }
  },

  // Set assignment time (openAt and dueAt)
  async setAssignmentTime(assignmentId, courseId, timeData) {
    try {
      const { openAt, dueAt } = timeData;
      const params = new URLSearchParams();

      if (openAt) {
        params.append('openAt', openAt);
      }
      if (dueAt) {
        params.append('dueAt', dueAt);
      }

      const response = await api.post(`/assignment/${assignmentId}/course/${courseId}/set-time?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error setting assignment time:', error);
      throw error;
    }
  },
};

export default lecturerService;
