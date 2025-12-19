'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationService, NotificationProps } from '@/services/notificationService';

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const removeNotification = useCallback((id: string) => {
    notificationService.remove(id);
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clear();
  }, []);

  return { notifications, removeNotification, clearAll };
}
