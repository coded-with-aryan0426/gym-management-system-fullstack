import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string, id?: string) => {
    toast.success(message, {
      id, // Allows updating an existing toast (e.g. replacing loading state)
      duration: 3000,
    });
  },

  error: (message: string, id?: string) => {
    toast.error(message, {
      id,
      duration: 5000,
    });
  },

  info: (message: string, id?: string) => {
    toast(message, {
      id,
      duration: 3000,
      icon: 'ℹ️',
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};
