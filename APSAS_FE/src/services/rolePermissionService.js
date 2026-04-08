import api from "./api";

/**
 * Service for handling role and permission operations
 * Based on APSAS Admin API Documentation v2025-11-26
 */
const rolePermissionService = {
  /**
   * Get all roles with their permissions
   * GET /admin/roles
   * Required permission: VIEW_ROLES
   */
  getRoles: async () => {
    try {
      const response = await api.get('/admin/roles');
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  /**
   * Get all permissions
   * GET /admin/roles/permissions
   * Required permission: VIEW_ROLES
   */
  getPermissions: async () => {
    try {
      // Correct endpoint: /admin/roles/permissions (not /admin/permissions)
      const response = await api.get('/admin/roles/permissions');
      return response.data;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw error;
    }
  },

  /**
   * Search roles by keyword
   * @param {string} keyword - Search keyword
   * @returns {Promise} Filtered roles
   */
  searchRoles: async (keyword) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/admin/roles/search?q=${keyword}`);
      // return response.data;

      const roles = await rolePermissionService.getRoles();
      return roles.filter(
        (role) =>
          role.name.toLowerCase().includes(keyword.toLowerCase()) ||
          role.description.toLowerCase().includes(keyword.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching roles:", error);
      throw error;
    }
  },

  /**
   * Search permissions by keyword
   * @param {string} keyword - Search keyword
   * @returns {Promise} Filtered permissions
   */
  searchPermissions: async (keyword) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/admin/permissions/search?q=${keyword}`);
      // return response.data;

      const permissions = await rolePermissionService.getPermissions();
      return permissions.filter(
        (permission) =>
          permission.name.toLowerCase().includes(keyword.toLowerCase()) ||
          permission.description.toLowerCase().includes(keyword.toLowerCase())
      );
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw error;
    }
  },

  /**
   * Get role detail by ID
   * Required permission: VIEW_ROLES
   */
  getRoleById: async (roleId) => {
    try {
      const response = await api.get(`/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching role detail:", error);
      throw error;
    }
  },

  /**
   * Create new role
   * POST /admin/roles
   * Required permission: CREATE_ROLES
   * @param {Object} roleData - Role data
   * @param {string} roleData.name - Role name
   * @param {string} roleData.description - Role description
   * @param {string[]} roleData.permissionNames - Array of permission names (e.g., ["VIEW_USERS", "CREATE_USERS"])
   */
  createRole: async (roleData) => {
    try {
      // Normalize role name and permission names to uppercase
      const normalizedPermissionNames = (roleData.permissionNames || []).map(p => 
        typeof p === 'string' ? p.toUpperCase().trim() : p
      ).filter(Boolean);
      
      const payload = {
        name: roleData.name ? roleData.name.toUpperCase().trim() : "",
        description: roleData.description || "",
        permissionNames: normalizedPermissionNames,
      };
      
      const response = await api.post('/admin/roles', payload);
      return response.data;
    } catch (error) {
      console.error("Error creating role:", error);
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      }
      throw error;
    }
  },

  /**
   * Update existing role
   * PUT /admin/roles/{roleId}
   * Required permission: UPDATE_ROLES
   * @param {number} roleId - Role ID
   * @param {Object} roleData - Role data
   * @param {string} roleData.name - Role name
   * @param {string} roleData.description - Role description
   * @param {string[]} roleData.permissionNames - Array of permission names (e.g., ["VIEW_USERS", "CREATE_USERS"])
   */
  updateRole: async (roleId, roleData) => {
    try {
      // Normalize role name and permission names to uppercase
      const normalizedPermissionNames = (roleData.permissionNames || []).map(p => 
        typeof p === 'string' ? p.toUpperCase().trim() : p
      ).filter(Boolean);
      
      const payload = {
        name: roleData.name ? roleData.name.toUpperCase().trim() : "",
        description: roleData.description || "",
        permissionNames: normalizedPermissionNames,
      };
      
      const response = await api.put(`/admin/roles/${roleId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating role:", error);
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      }
      throw error;
    }
  },

  /**
   * Delete role permanently
   * Required permission: DELETE_ROLES
   */
  deleteRole: async (roleId) => {
    try {
      const response = await api.delete(`/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  },
};

export default rolePermissionService;
