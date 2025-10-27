import { NotificationProps } from '@/components/ui/Notification';

export interface NotificationOptions {
  type?: NotificationProps['type'];
  duration?: number;
  showCloseButton?: boolean;
  icon?: React.ReactNode;
}

class NotificationService {
  private notifications: NotificationProps[] = [];
  private listeners: ((notifications: NotificationProps[]) => void)[] = [];
  private nextId = 1;

  private generateId(): string {
    return `notification-${this.nextId++}`;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  subscribe(listener: (notifications: NotificationProps[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private addNotification(notification: Omit<NotificationProps, 'id'>) {
    const id = this.generateId();
    const newNotification: NotificationProps = {
      ...notification,
      id
    };
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    
    return id;
  }

  success(title: string, message: string, options?: NotificationOptions) {
    return this.addNotification({
      type: 'success',
      title,
      message,
      duration: options?.duration || 5000,
      showCloseButton: options?.showCloseButton ?? true,
      icon: options?.icon
    });
  }

  error(title: string, message: string, options?: NotificationOptions) {
    return this.addNotification({
      type: 'error',
      title,
      message,
      duration: options?.duration || 7000,
      showCloseButton: options?.showCloseButton ?? true,
      icon: options?.icon
    });
  }

  warning(title: string, message: string, options?: NotificationOptions) {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      duration: options?.duration || 6000,
      showCloseButton: options?.showCloseButton ?? true,
      icon: options?.icon
    });
  }

  info(title: string, message: string, options?: NotificationOptions) {
    return this.addNotification({
      type: 'info',
      title,
      message,
      duration: options?.duration || 5000,
      showCloseButton: options?.showCloseButton ?? true,
      icon: options?.icon
    });
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  clear() {
    this.notifications = [];
    this.notifyListeners();
  }

  getNotifications(): NotificationProps[] {
    return [...this.notifications];
  }
}

export const notificationService = new NotificationService();