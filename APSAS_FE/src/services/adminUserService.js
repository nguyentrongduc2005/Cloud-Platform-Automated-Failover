import api from "./api";

/**
 * Service for Admin User Management
 * All endpoints require appropriate admin permissions
 * Based on APSAS Admin API Documentation v2025-11-26
 */
const adminUserService = {
  /**
   * Get paginated list of users
   * GET /admin/users?page=0&size=10&keyword=&status=&roleId=
   * Required permission: VIEW_USERS
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-based)
   * @param {number} params.size - Items per page
   * @param {string} params.keyword - Search by name/email
   * @param {string} params.status - Filter: ACTIVE, INACTIVE, BANNED, BLOCKED
   * @param {number} params.roleId - Filter by role ID
   */
  async getUsers(params = {}) {
    try {
      const queryParams = {
        page: params.page !== undefined ? params.page : 0,
        size: params.size || 10,
      };

      // API uses 'keyword' for search (not 'search')
      if (params.keyword) queryParams.keyword = params.keyword;
      if (params.search) queryParams.keyword = params.search; // backward compatibility
      
      if (params.status) queryParams.status = params.status;
      
      // API uses 'roleId' (not 'role')
      if (params.roleId) queryParams.roleId = params.roleId;
      if (params.role) queryParams.roleId = params.role; // backward compatibility

      const response = await api.get("/admin/users", { params: queryParams });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  /**
   * Get user detail by ID
   * Required permission: VIEW_USERS
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user detail:", error);
      throw error;
    }
  },

  /**
   * Create new user
   * POST /admin/users
   * Required permission: CREATE_USERS
   * @param {Object} userData - User data
   * @param {string} userData.name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password (min 8 chars with uppercase, lowercase, number, special char)
   * @param {string[]} userData.roleNames - Array of role names (e.g., ["STUDENT", "LECTURER"])
   * @param {string} userData.status - Status: ACTIVE, INACTIVE, BANNED, BLOCKED
   */
  async createUser(userData) {
    try {
      // Normalize role names to uppercase
      const roleNames = userData.roleNames || 
        (userData.roles ? userData.roles.map(r => typeof r === 'string' ? r.toUpperCase().trim() : r.name?.toUpperCase().trim()).filter(Boolean) : ["STUDENT"]);
      
      // Transform payload to match API spec
      const payload = {
        name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email,
        password: userData.password,
        roleNames: roleNames,
        status: userData.status || "ACTIVE",
      };
      
      const response = await api.post("/admin/users", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      }
      throw error;
    }
  },

  /**
   * Update user status (ACTIVE, BLOCKED, UNVERIFIED)
   * No specific permission required (accessible by admins)
   */
  async updateUserStatus(userId, status) {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  /**
   * Update user roles
   * PUT /admin/users/{userId}/roles
   * Required permission: UPDATE_USERS
   * @param {number} userId - User ID
   * @param {string[]} roleNames - Array of role names (e.g., ["STUDENT", "LECTURER"])
   */
  async updateUserRoles(userId, roleNames) {
    try {
      // Normalize roleNames to array and ensure uppercase
      // Backend also normalizes, but we do it here for consistency
      const normalizedRoleNames = Array.isArray(roleNames) 
        ? roleNames.map(r => typeof r === 'string' ? r.toUpperCase().trim() : r).filter(Boolean)
        : [typeof roleNames === 'string' ? roleNames.toUpperCase().trim() : roleNames].filter(Boolean);
      
      if (normalizedRoleNames.length === 0) {
        throw new Error("At least one role name is required");
      }
      
      // API expects { roleNames: ["STUDENT", "LECTURER"] }
      const payload = { 
        roleNames: normalizedRoleNames
      };
      
      const response = await api.put(`/admin/users/${userId}/roles`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating user roles:", error);
      // Re-throw with more context if needed
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      }
      throw error;
    }
  },

  /**
   * Delete user permanently
   * Required permission: DELETE_USERS
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  /**
   * Get user statistics
   * Required permission: VIEW_USERS
   */
  async getUserStatistics() {
    try {
      const response = await api.get("/admin/users/statistics");
      return response.data;
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      throw error;
    }
  },

  // Legacy method for backward compatibility
  async toggleUserStatus(userId, newStatus) {
    return this.updateUserStatus(userId, newStatus);
  },

  // Legacy method for backward compatibility
  async updateUser(userId, userData) {
    if (userData.roleNames) {
      return this.updateUserRoles(userId, userData.roleNames);
    }
    if (userData.status) {
      return this.updateUserStatus(userId, userData.status);
    }
    throw new Error("Invalid update data");
  },
};

export default adminUserService;
