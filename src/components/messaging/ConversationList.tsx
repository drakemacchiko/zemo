'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatMessageForNotification } from '@/lib/messaging';

interface Conversation {
  id: string;
  participant: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      profilePictureUrl?: string;
    };
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  vehicle?: {
    make: string;
    model: string;
    year: number;
  };
  booking?: {
    confirmationNumber: string;
  };
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
        </div>
        <div className="p-4 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchConversations}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.455L3 21l2.455-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <p>No conversations yet</p>
            <p className="text-sm">Start a conversation with a host or renter</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversationId === conversation.id ? 'bg-yellow-50 border-r-2 border-yellow-400' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium overflow-hidden">
                  {conversation.participant.profile?.profilePictureUrl ? (
                    <Image
                      src={conversation.participant.profile.profilePictureUrl}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {conversation.participant.profile?.firstName?.[0] || conversation.participant.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name and unread count */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.participant.profile
                        ? `${conversation.participant.profile.firstName} ${conversation.participant.profile.lastName}`
                        : conversation.participant.email}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Vehicle info */}
                  {conversation.vehicle && (
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.vehicle.year} {conversation.vehicle.make} {conversation.vehicle.model}
                      {conversation.booking && ` • ${conversation.booking.confirmationNumber}`}
                    </p>
                  )}

                  {/* Last message */}
                  {conversation.lastMessage ? (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {formatMessageForNotification(conversation.lastMessage.content, 60)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">No messages yet</p>
                  )}

                  {/* Timestamp */}
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}