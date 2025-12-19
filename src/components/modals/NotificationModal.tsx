'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, MessageCircle, Heart, Plus, Zap, Eye } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTIFICATION_CONFIG: Record<string, { icon: typeof Bell; bg: string }> = {
  comment: { icon: MessageCircle, bg: 'bg-purple-500' },
  like: { icon: Heart, bg: 'bg-red-500' },
  invite: { icon: Plus, bg: 'bg-green-500' },
  generate: { icon: Zap, bg: 'bg-yellow-500' },
  default: { icon: Bell, bg: 'bg-blue-500' },
};

const AVATAR_COLORS = ['bg-blue-500', 'bg-orange-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500'];

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const { notifications, removeNotification, clearAll } = useNotification();
  const modalRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;
  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !readNotifications.has(n.id))
    : notifications;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const markAsRead = (id: string) => setReadNotifications(prev => new Set([...prev, id]));
  const markAllAsRead = () => setReadNotifications(prev => new Set([...prev, ...notifications.map(n => n.id)]));
  const getConfig = (type: string) => NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.default;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full font-medium">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'all' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'unread' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Mark all as read</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={clearAll}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'unread' 
                      ? 'You\'re all caught up! Check back later for new updates.'
                      : 'You\'ll see notifications here when you receive them.'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification, index) => {
                    const isRead = readNotifications.has(notification.id);
                    const notificationType = notification.type || 'info';
                    const userName = notification.userName || 'User';
                    const timeAgo = notification.timeAgo || '1h ago';
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                          isRead ? 'bg-gray-50/30' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white font-semibold text-sm`}>
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            {/* Notification Icon Overlay */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getConfig(notificationType).bg} flex items-center justify-center`}>
                              {(() => { const Icon = getConfig(notificationType).icon; return <Icon className="w-3 h-3 text-white" />; })()}
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-semibold ${isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                                  {userName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {timeAgo}
                                </span>
                              </div>
                              {!isRead && (
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            
                            <p className={`text-sm ${isRead ? 'text-gray-400' : 'text-gray-700'} leading-relaxed`}>
                              {notification.message}
                            </p>
                            
                            {/* Action Buttons for specific types */}
                            {notificationType === 'invite' && (
                              <div className="flex space-x-2 mt-3">
                                <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200">
                                  Decline
                                </button>
                                <button className="px-3 py-1 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors duration-200">
                                  Accept
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-1">
                            {!isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 hover:bg-blue-100 rounded-full transition-colors duration-200"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                              title="Delete notification"
                            >
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

