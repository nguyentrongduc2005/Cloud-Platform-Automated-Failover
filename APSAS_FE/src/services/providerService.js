import api from "./api";

// Service cho Provider Resources
const providerService = {
  // Lấy danh sách tài nguyên của provider (API 32)
  async getResources(params = {}) {
    try {
      const { page = 1, limit = 10, keyword = "" } = params;

      // Gọi API GET /tutorials với search query
      const res = await api.get("/tutorials", {
        params: {
          search: keyword || "",
          page: page - 1,
          size: limit,
        },
      });

      console.log("📦 Provider resources response:", res.data);

      const responseData = res.data?.data;
      const list = responseData?.content || [];
      const totalElements = responseData?.totalElements || 0;
      const totalPages = responseData?.totalPages || 1;
      const currentPage = (responseData?.number || 0) + 1;

      // Map dữ liệu từ BE -> FE resource card
      const mapped = list.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.summary,
        status: t.status,
        contentCount: t.lessonCount ?? 0,
        exerciseCount: t.assignmentCount ?? 0,
        imageCount: t.mediaCount ?? 0,
        createdBy: t.creatorName || "Unknown",
        createdAt: t.createdDate
          ? new Date(t.createdDate).toLocaleDateString("vi-VN")
          : "",
        creatorAvatar: t.creatorAvatar || "",
        type: "VIDEO",
      }));

      return {
        data: mapped,
        pagination: {
          page: currentPage,
          limit,
          total: totalElements,
          totalPages: totalPages,
        },
      };
    } catch (error) {
      console.error("Error fetching provider resources:", error);
      throw error;
    }
  },

  // Xóa tài nguyên
  async deleteResource(id) {
    try {
      const response = await api.delete(`/api/tutorials/${id}`);

      return {
        success: true,
        message: response.data?.message || "Xóa tài nguyên thành công",
      };
    } catch (error) {
      console.error("Error deleting resource:", error);
      throw error;
    }
  },
};

export default providerService;
