'use client'

import { useState, useEffect } from 'react'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const res = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
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
        <h1 className="text-3xl font-black mb-6">Messages</h1>
        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No messages yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md divide-y">
            {conversations.map(conv => (
              <div key={conv.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-bold">{conv.otherUser?.name || 'User'}</p>
                <p className="text-sm text-gray-600">{conv.lastMessage}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
