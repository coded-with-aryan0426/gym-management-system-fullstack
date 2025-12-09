import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--success)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-4)',
      },
      iconTheme: {
        primary: 'var(--success)',
        secondary: 'var(--bg-secondary)',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--error)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-4)',
      },
      iconTheme: {
        primary: 'var(--error)',
        secondary: 'var(--bg-secondary)',
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--accent-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-4)',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-4)',
      },
    });
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};
