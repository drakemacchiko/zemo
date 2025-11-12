'use client'

import { useState, useEffect } from 'react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow" /></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-6">Notifications</h1>
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No notifications</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md divide-y">
            {notifications.map(notif => (
              <div key={notif.id} className="p-4">
                <p className="font-semibold">{notif.title}</p>
                <p className="text-sm text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
