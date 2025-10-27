'use client';

import { useState, useEffect } from 'react';
import { notificationService, NotificationOptions } from '@/services/notificationService';
import { NotificationProps } from '@/components/ui/Notification';

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const showSuccess = (title: string, message: string, options?: NotificationOptions) => {
    return notificationService.success(title, message, options);
  };

  const showError = (title: string, message: string, options?: NotificationOptions) => {
    return notificationService.error(title, message, options);
  };

  const showWarning = (title: string, message: string, options?: NotificationOptions) => {
    return notificationService.warning(title, message, options);
  };

  const showInfo = (title: string, message: string, options?: NotificationOptions) => {
    return notificationService.info(title, message, options);
  };

  const removeNotification = (id: string) => {
    notificationService.remove(id);
  };

  const clearAll = () => {
    notificationService.clear();
  };

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll
  };
}

