import { useState } from "react";
import { Send, MessageCircle, Mail, Phone } from "lucide-react";

function Support() {
  const [formData, setFormData] = useState({
    subject: "",
    category: "technical",
    message: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Gọi API gửi yêu cầu hỗ trợ
      // await supportService.createTicket(formData);

      // Mock success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitStatus({
        type: "success",
        message: "Yêu cầu hỗ trợ của bạn đã được gửi thành công!",
      });

      // Reset form
      setFormData({
        subject: "",
        category: "technical",
        message: "",
        email: "",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Hỗ trợ</h1>
        <p className="text-sm text-gray-400">
          Gửi yêu cầu hỗ trợ của bạn và chúng tôi sẽ phản hồi trong thời gian
          sớm nhất
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact Card */}
          <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-5 space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Thông tin liên hệ
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Mail size={18} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <div className="text-white text-sm">support@apsas.edu.vn</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Phone size={18} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Hotline</div>
                  <div className="text-white text-sm">1900 1234</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MessageCircle size={18} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Giờ làm việc</div>
                  <div className="text-white text-sm">
                    T2 - T6: 8:00 - 17:00
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-3">
              Câu hỏi thường gặp
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Xem các câu hỏi thường gặp để tìm câu trả lời nhanh chóng
            </p>
            <button className="w-full px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition text-sm font-medium">
              Xem FAQ
            </button>
          </div>
        </div>

        {/* Support Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-5">
              Gửi yêu cầu hỗ trợ
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email của bạn <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[#0b0f12] border border-[#202934] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Danh mục <span className="text-red-400">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[#0b0f12] border border-[#202934] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="technical">Vấn đề kỹ thuật</option>
                  <option value="account">Tài khoản</option>
                  <option value="course">Khóa học</option>
                  <option value="payment">Thanh toán</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Tiêu đề <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[#0b0f12] border border-[#202934] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Mô tả ngắn gọn vấn đề của bạn"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Nội dung <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2.5 bg-[#0b0f12] border border-[#202934] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition resize-none"
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                />
              </div>

              {/* Submit Status */}
              {submitStatus && (
                <div
                  className={`p-4 rounded-lg border ${
                    submitStatus.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Gửi yêu cầu</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
