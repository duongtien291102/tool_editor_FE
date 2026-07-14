import { toast } from 'sonner';

export class NotificationCenter {
  success(message: string, description?: string) {
    toast.success(message, { description });
  }

  error(message: string, description?: string) {
    toast.error(message, { description });
  }

  info(message: string, description?: string) {
    toast.info(message, { description });
  }

  warning(message: string, description?: string) {
    toast.warning(message, { description });
  }

  promise<T>(promise: Promise<T>, loadingMsg: string, successMsg: string, errorMsg: string) {
    toast.promise(promise, {
      loading: loadingMsg,
      success: successMsg,
      error: errorMsg,
    });
  }
}

export const notificationCenter = new NotificationCenter();
