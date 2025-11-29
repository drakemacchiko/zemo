'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  messageType: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
      profilePictureUrl?: string;
    };
  };
  attachmentUrl?: string;
  attachmentType?: string;
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
  otherParty: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  vehicle?: {
    id: string;
    name: string;
    photo?: string | null;
  } | null;
  booking?: any;
}

export default function MessageThread({
  conversationId,
  currentUserId,
  otherParty,
  vehicle,
  booking,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const fetchMessages = useCallback(async (pageNum = 1) => {
    try {
      const response = await fetch(
        `/api/messages/conversations/${conversationId}?page=${pageNum}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      if (data.success) {
        if (pageNum === 1) {
          setMessages(data.messages);
        } else {
          setMessages((prev) => [...data.messages, ...prev]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          conversationId,
          content: newMessage,
          messageType: 'TEXT',
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey]!.push(message);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {otherParty.avatar ? (
              <img
                src={otherParty.avatar}
                alt={otherParty.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold">
                {otherParty.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{otherParty.name}</h3>
              {vehicle && (
                <p className="text-sm text-gray-500">{vehicle.name}</p>
              )}
            </div>
          </div>

          {booking && (
            <a
              href={`/bookings/${booking.id}`}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              View Booking
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {hasMore && (
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchMessages(nextPage);
            }}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Load older messages
          </button>
        )}

        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              const isSystemMessage = message.messageType === 'SYSTEM';

              if (isSystemMessage) {
                return (
                  <div
                    key={message.id}
                    className="flex justify-center my-2"
                  >
                    <div className="bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg max-w-md text-center">
                      {message.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  } mb-2`}
                >
                  <div
                    className={`max-w-[70%] ${
                      isOwnMessage
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-gray-900'
                    } rounded-lg px-4 py-2 shadow-sm`}
                  >
                    {message.attachmentUrl && (
                      <div className="mb-2">
                        {message.attachmentType === 'IMAGE' ? (
                          <img
                            src={message.attachmentUrl}
                            alt="Attachment"
                            className="rounded max-w-full"
                          />
                        ) : (
                          <a
                            href={message.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            View attachment
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-1 space-x-2">
                      <span
                        className={`text-xs ${
                          isOwnMessage ? 'text-yellow-100' : 'text-gray-500'
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {isOwnMessage && (
                        <span
                          className={`text-xs ${
                            message.isRead ? 'text-yellow-100' : 'text-yellow-200'
                          }`}
                        >
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-gray-200 p-4"
      >
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Send a message..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              rows={1}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {newMessage.length}/2000 • Press Enter to send, Shift+Enter for new line
            </p>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
