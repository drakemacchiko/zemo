'use client';

import { useState, useEffect, useCallback } from 'react';

interface Conversation {
  id: string;
  otherParty: {
    id: string;
    name: string;
    avatar: string | null;
  };
  vehicle?: {
    id: string;
    name: string;
    photo: string | null;
  } | null;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string | null;
  currentUserId: string;
}

export default function ConversationList({
  onSelectConversation,
  selectedConversationId,
  currentUserId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/messages/conversations?filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchConversations();

    // Poll for new conversations every 10 seconds
    const interval = setInterval(() => {
      fetchConversations();
    }, 10000);

    return () => clearInterval(interval);
  }, [filter, fetchConversations]);

  const filteredConversations = conversations.filter((conv) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.otherParty.name.toLowerCase().includes(query) ||
        conv.vehicle?.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatLastMessageTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${Math.floor(diffMinutes)}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const truncateMessage = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />

        {/* Filters */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'all'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'unread'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Start a conversation by messaging a host
            </p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-yellow-50' : ''
                  } ${hasUnread ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    {conversation.otherParty.avatar ? (
                      <img
                        src={conversation.otherParty.avatar}
                        alt={conversation.otherParty.name}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {conversation.otherParty.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold text-sm ${
                            hasUnread ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {conversation.otherParty.name}
                        </h3>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-gray-500 ml-2">
                            {formatLastMessageTime(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      {conversation.vehicle && (
                        <p className="text-xs text-gray-500 mb-1">
                          {conversation.vehicle.name}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        {conversation.lastMessage && (
                          <p
                            className={`text-sm ${
                              hasUnread
                                ? 'text-gray-900 font-medium'
                                : 'text-gray-500'
                            }`}
                          >
                            {conversation.lastMessage.senderId === currentUserId
                              ? 'You: '
                              : ''}
                            {truncateMessage(conversation.lastMessage.content)}
                          </p>
                        )}
                        {hasUnread && (
                          <span className="ml-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
