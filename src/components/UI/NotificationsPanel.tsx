import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

const NotificationsPanel: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate real-time notifications with polling
  useEffect(() => {
    const generateNotifications = () => {
      const now = new Date().toISOString();
      let newNotifications: Notification[] = [];

      if (user?.role === 'student') {
        newNotifications = [
          {
            id: '1',
            message: 'Low attendance alert: Software Engineering (65%)',
            type: 'warning',
            timestamp: now,
            read: false
          },
          {
            id: '2',
            message: 'Timetable updated for Computer Science Semester 6',
            type: 'info',
            timestamp: now,
            read: false
          },
          {
            id: '3',
            message: 'Assignment deadline approaching: Database Management',
            type: 'warning',
            timestamp: now,
            read: true
          }
        ];
      } else if (user?.role === 'teacher') {
        newNotifications = [
          {
            id: '1',
            message: 'Reminder: Mark attendance for today\'s classes',
            type: 'info',
            timestamp: now,
            read: false
          },
          {
            id: '2',
            message: 'New student enrolled in Computer Science Semester 6',
            type: 'success',
            timestamp: now,
            read: false
          },
          {
            id: '3',
            message: 'Timetable upload successful for next week',
            type: 'success',
            timestamp: now,
            read: true
          }
        ];
      } else if (user?.role === 'admin') {
        newNotifications = [
          {
            id: '1',
            message: 'System backup completed successfully',
            type: 'success',
            timestamp: now,
            read: false
          },
          {
            id: '2',
            message: 'New teacher registration pending approval',
            type: 'info',
            timestamp: now,
            read: false
          },
          {
            id: '3',
            message: 'Monthly attendance report generated',
            type: 'success',
            timestamp: now,
            read: true
          }
        ];
      }

      setNotifications(newNotifications);
    };

    generateNotifications();
    
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(generateNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    const iconProps = { className: "h-5 w-5" };
    switch (type) {
      case 'success': return <CheckCircle {...iconProps} className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle {...iconProps} className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertCircle {...iconProps} className="h-5 w-5 text-red-500" />;
      default: return <Info {...iconProps} className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Notification panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border shadow-lg z-20 max-h-96 overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto max-h-80">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-4 border-b border-gray-100 ${getBgColor(notification.type)}
                      ${!notification.read ? 'font-medium' : ''}
                      hover:bg-opacity-80 transition-colors
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            aria-label="Mark as read"
                          >
                            Read
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Dismiss notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPanel;