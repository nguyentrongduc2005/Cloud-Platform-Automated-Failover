import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import notificationService from "../../services/notificationService";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: 0,
        size: 20,
      };
      
      const result = await notificationService.getNotifications(params);
      
      // Handle response format
      let notificationList = [];
      if (result.data) {
        if (Array.isArray(result.data)) {
          notificationList = result.data;
        } else if (result.data.content && Array.isArray(result.data.content)) {
          notificationList = result.data.content;
        }
      }
      
      // Filter based on selected filter
      if (filter === "unread") {
        notificationList = notificationList.filter(n => !n.isRead);
      } else if (filter === "read") {
        notificationList = notificationList.filter(n => n.isRead);
      }
      
      // Backend đã parse payload và trả về field `message`
      // Giữ payload (JSON string) nếu cần thông tin chi tiết
      // Ưu tiên sử dụng field `message` từ backend
      
      setNotifications(notificationList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const result = await notificationService.getUnreadCount();
      // Extract unreadCount from response
      const count = result?.data?.unreadCount || 
                   result?.unreadCount || 
                   (typeof result?.data === 'number' ? result.data : 0);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      // Refresh unread count
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      // Refresh unread count
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      // Refresh unread count
      fetchUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      fetchNotifications();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, filter]);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getNotificationMessage = (notification) => {
    // Ưu tiên sử dụng field `message` từ backend (đã được parse sẵn)
    if (notification.message) {
      return notification.message;
    }
    
    // Fallback: Parse payload nếu không có message (tương thích ngược)
    if (notification.payload) {
      if (typeof notification.payload === 'string') {
        try {
          const parsed = JSON.parse(notification.payload);
          if (parsed.message) {
            return parsed.message;
          }
        } catch (e) {
          // Nếu không phải JSON, dùng payload như string
          return notification.payload;
        }
      } else if (notification.payload.message) {
        return notification.payload.message;
      }
    }
    
    // Fallback cuối cùng: dùng type
    if (notification.type) {
      return `Bạn có thông báo mới: ${notification.type}`;
    }
    
    return "Bạn có thông báo mới";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-lg border border-[#202934] bg-[#0b0f12] text-white hover:bg-[#131a22] transition flex items-center justify-center"
        title="Thông báo"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-[#0b0f12] border border-[#202934] rounded-xl shadow-xl z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#202934]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Thông báo</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <CheckCheck size={14} />
                    Đọc tất cả
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* Filter tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-2 py-1 text-xs rounded transition ${
                  filter === "all"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-2 py-1 text-xs rounded transition ${
                  filter === "unread"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-2 py-1 text-xs rounded transition ${
                  filter === "read"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Đã đọc
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Đang tải...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Không có thông báo nào
              </div>
            ) : (
              <div className="divide-y divide-[#202934]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-[#131a22] transition ${
                      !notification.isRead ? "bg-[#0f1419]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-slate-200">
                            {getNotificationMessage(notification)}
                          </p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-slate-400 hover:text-emerald-400 transition"
                            title="Đánh dấu đã đọc"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

