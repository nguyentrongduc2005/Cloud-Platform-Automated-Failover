import api from "./api";

/**
 * Service for Notification Management
 * Based on APSAS Admin API specification
 */
const notificationService = {
  /**
   * Create a new notification (Admin only)
   * Required permission: ADMIN
   * @param {Object} notificationData - Notification data
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.content - Notification content/message
   * @param {string} notificationData.target - Target audience (ALL, STUDENTS, LECTURERS, CONTENT_PROVIDERS, or specific userId)
   * @returns {Promise<{code: string, message: string, data: Object}>}
   */
  async createNotification(notificationData) {
    try {
      const payload = {
        title: notificationData.title,
        content: notificationData.content,
        target: notificationData.target || "ALL",
      };
      
      const response = await api.post("/notifications", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  /**
   * Get notifications for current user
   * GET /notifications?page=1&limit=20
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (1-based)
   * @param {number} params.limit - Page size
   * @param {number} params.size - Backward-compatible alias for limit
   * @returns {Promise<{code: string, message: string, data: Object}>}
   */
  async getNotifications(params = {}) {
    try {
      const rawPage = Number(params.page);
      const page = Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1;
      const rawLimit = Number(params.limit ?? params.size);
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 20;

      const queryParams = {
        page,
        limit,
      };

      if (params.isRead !== undefined) {
        queryParams.isRead = params.isRead;
      }
      
      const response = await api.get("/notifications", { params: queryParams });
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Get notification by ID
   * @param {number|string} notificationId - Notification ID
   * @returns {Promise<{code: string, message: string, data: Object}>}
   */
  async getNotificationById(notificationId) {
    try {
      const response = await api.get(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notification detail:", error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {number|string} notificationId - Notification ID
   * @returns {Promise<{code: string, message: string, data: Object}>}
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<{code: string, message: string, data: Object}>}
   */
  async markAllAsRead() {
    try {
      const response = await api.put("/notifications/read-all");
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  /**
   * Delete notification
   * @param {number|string} notificationId - Notification ID
   * @returns {Promise<{code: string, message: string, data: Object}>}
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<{code: string, message: string, data: number}>}
   */
  async getUnreadCount() {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  },
};

export default notificationService;

