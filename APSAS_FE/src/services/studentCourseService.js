// src/services/studentCourseService.js
import api from './api';

/**
 * Student Course Service - Xử lý API liên quan đến khóa học của sinh viên
 */
export const studentCourseService = {
  /**
   * Lấy danh sách khóa học của sinh viên hiện tại
   * @param {Object} params - Query parameters
   * @param {number} params.page - Số trang (0-indexed)
   * @param {number} params.size - Kích thước trang
   * @param {string} params.sort - Sắp xếp (vd: "name,asc")
   * @returns {Promise} API response
   */
  async getMyCourses(params = {}) {
    const {
      page = 0,
      size = 6,
      sort = '',
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (sort) {
      queryParams.append('sort', sort);
    }

    try {
      const response = await api.get(`/courses/student/my-courses?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student courses:', error);
      throw error;
    }
  },

  /**
   * Tham gia khóa học bằng mã code hoặc courseId
   * @param {string|number} identifier - Mã khóa học (string) hoặc courseId (number)
   * @returns {Promise} API response
   */
  async joinCourse(identifier) {
    let payload = {};

    // Nếu identifier là string thì là code, nếu là number thì là courseId
    if (typeof identifier === 'string') {
      payload = { code: identifier.trim() };
    } else if (typeof identifier === 'number') {
      payload = { courseId: identifier };
    } else {
      throw new Error('Invalid identifier type. Must be string (code) or number (courseId)');
    }

    const response = await api.post('/courses/join', payload);
    return response.data;
  },

  /**
   * Tham gia khóa học bằng mã code (helper method)
   * @param {string} courseCode - Mã khóa học
   * @returns {Promise} API response
   */
  async joinCourseByCode(courseCode) {
    return this.joinCourse(courseCode);
  },

  /**
   * Tham gia khóa học bằng courseId (helper method)
   * @param {number} courseId - ID khóa học
   * @returns {Promise} API response
   */
  async joinCourseById(courseId) {
    return this.joinCourse(courseId);
  },

  /**
   * Rời khỏi khóa học
   * @param {number} courseId - ID khóa học
   * @returns {Promise} API response
   */
  async leaveCourse(courseId) {
    try {
      const response = await api.delete(`/courses/student/${courseId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Error leaving course:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết khóa học cho student
   * @param {number} courseId - ID khóa học
   * @returns {Promise} API response
   */
  async getCourseDetail(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/detail-student`);
      return response.data;
    } catch (error) {
      console.error('Error getting course detail:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết content cho student
   * @param {number} contentId - ID của content
   * @returns {Promise} API response
   */
  async getContentDetail(contentId) {
    try {
      const response = await api.get(`/tutorials/contents/${contentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting content detail:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết assignment cho student
   * @param {number} courseId - ID khóa học
   * @param {number} assignmentId - ID assignment
   * @returns {Promise} API response
   */
  async getAssignmentDetail(courseId, assignmentId) {
    try {
      const response = await api.get(`/assignment/${courseId}/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting assignment detail:', error);
      throw error;
    }
  }
};

export default studentCourseService;