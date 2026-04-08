import { toast } from 'sonner';

export const useToast = () => {
  const showToast = (message, type = 'success') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
        toast.info(message);
        break;
      default:
        toast(message);
    }
  };

  // No need for ToastContainer as Sonner handles it globally
  const ToastContainer = () => null;

  return { showToast, ToastContainer };
};