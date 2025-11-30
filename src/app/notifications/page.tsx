'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  booking?: {
    id: string;
    confirmationNumber: string;
    status: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
  };
}

type FilterType = 'all' | 'unread' | 'bookings' | 'messages' | 'account';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?filter=${filter}&page=${page}&limit=20`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
        }
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setTotalPages(data.totalPages);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ notificationIds }),
      });

      // Update local state
      setNotifications(prev =>
        prev.map(notif => (notificationIds.includes(notif.id) ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      await Promise.all(
        notificationIds.map(id =>
          fetch(`/api/notifications/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
        )
      );

      // Update local state
      setNotifications(prev => prev.filter(notif => !notificationIds.includes(notif.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return '✓';
      case 'BOOKING_CANCELLED':
        return '✗';
      case 'PAYMENT_SUCCESS':
        return '💳';
      case 'PAYMENT_FAILED':
        return '⚠️';
      case 'MESSAGE_RECEIVED':
        return '💬';
      case 'DOCUMENT_REQUIRED':
        return '📄';
      case 'VEHICLE_APPROVED':
        return '🚗';
      case 'SYSTEM_ANNOUNCEMENT':
        return '📢';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupNotificationsByDate = () => {
    const grouped: { [key: string]: Notification[] } = {};
    notifications.forEach(notif => {
      const dateKey = formatDate(notif.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notif);
    });
    return grouped;
  };

  const groupedNotifications = groupNotificationsByDate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 border border-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'unread', 'bookings', 'messages', 'account'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-700">{selectedIds.size} selected</span>
            <div className="flex gap-3">
              <button
                onClick={() => markAsRead(Array.from(selectedIds))}
                className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
              >
                Mark as read
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete selected notifications?')) {
                    deleteNotifications(Array.from(selectedIds));
                  }
                }}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Notifications list */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-12">
              <svg
                className="w-20 h-20 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-gray-500 text-lg">No notifications found</p>
              <p className="text-gray-400 text-sm mt-2">
                {filter !== 'all' ? 'Try changing the filter' : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div>
              {/* Select all checkbox */}
              {notifications.length > 0 && (
                <div className="border-b border-gray-200 p-4 bg-gray-50">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === notifications.length}
                      onChange={selectAll}
                      className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Select all</span>
                  </label>
                </div>
              )}

              {/* Grouped notifications */}
              {Object.entries(groupedNotifications).map(([date, notifs]) => (
                <div key={date}>
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">{date}</h3>
                  </div>
                  {notifs.map(notification => (
                    <div
                      key={notification.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="p-4 flex items-start space-x-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedIds.has(notification.id)}
                          onChange={() => toggleSelect(notification.id)}
                          className="mt-1 w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                        />

                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium text-gray-900 ${
                                  !notification.isRead ? 'font-semibold' : ''
                                }`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-4 mt-3">
                            {notification.actionUrl && (
                              <button
                                onClick={() => {
                                  if (!notification.isRead) {
                                    markAsRead([notification.id]);
                                  }
                                  router.push(notification.actionUrl!);
                                }}
                                className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
                              >
                                View details →
                              </button>
                            )}
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead([notification.id])}
                                className="text-sm font-medium text-gray-600 hover:text-gray-700"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Delete this notification?')) {
                                  deleteNotifications([notification.id]);
                                }
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

