'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  messageType: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
}

export function MessageThread({ conversationId, currentUserId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          conversationId,
          content: newMessage.trim(),
          messageType: 'TEXT',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      // Refresh messages to show the new one
      fetchMessages();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white rounded-lg shadow-sm border flex flex-col">
        <div className="p-4 border-b">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-xs">
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border flex flex-col h-96">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Messages</h3>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg
              className="w-12 h-12 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.455L3 21l2.455-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
              />
            </svg>
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === currentUserId
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.senderId !== currentUserId && (
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {message.sender.profile
                      ? `${message.sender.profile.firstName} ${message.sender.profile.lastName}`
                      : 'User'}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <div
                  className={`flex items-center justify-between mt-1 ${
                    message.senderId === currentUserId ? 'text-black/70' : 'text-gray-500'
                  }`}
                >
                  <p className="text-xs">{formatTime(message.createdAt)}</p>
                  {message.senderId === currentUserId && (
                    <span className="text-xs ml-2">{message.isRead ? '✓✓' : '✓'}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
