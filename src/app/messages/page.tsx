'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ConversationList from '@/components/messages/ConversationList';
import MessageThread from '@/components/messages/MessageThread';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversation');

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationIdFromUrl
  );
  const [conversationData, setConversationData] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const parts = token.split('.');
      if (parts[1]) {
        const payload = JSON.parse(atob(parts[1]));
        setCurrentUserId(payload.userId);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  // Fetch conversation data when selected
  useEffect(() => {
    if (!selectedConversationId) {
      setConversationData(null);
      return;
    }

    const fetchConversationData = async () => {
      try {
        const response = await fetch(`/api/messages/conversations/${selectedConversationId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch conversation');

        const data = await response.json();
        if (data.success) {
          setConversationData(data.conversation);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    fetchConversationData();
  }, [selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    router.push(`/messages?conversation=${conversationId}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop layout: side-by-side */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Conversations list (left) */}
          <div className="w-80 flex-shrink-0">
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
              currentUserId={currentUserId}
            />
          </div>

          {/* Message thread (right) */}
          <div className="flex-1">
            {selectedConversationId && conversationData ? (
              <MessageThread
                conversationId={selectedConversationId}
                currentUserId={currentUserId}
                otherParty={conversationData.otherParty}
                vehicle={conversationData.vehicle}
                booking={conversationData.booking}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                <svg
                  className="w-24 h-24 text-gray-300 mb-4"
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
                <p className="text-xl text-gray-500 font-medium">Select a conversation</p>
                <p className="text-sm text-gray-400 mt-2">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile layout: one at a time */}
        <div className="md:hidden flex-1 overflow-hidden">
          {!selectedConversationId ? (
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
              currentUserId={currentUserId}
            />
          ) : conversationData ? (
            <div className="h-full flex flex-col">
              {/* Back button for mobile */}
              <div className="bg-white border-b border-gray-200 p-4">
                <button
                  onClick={() => {
                    setSelectedConversationId(null);
                    router.push('/messages', { scroll: false });
                  }}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to conversations
                </button>
              </div>
              <div className="flex-1">
                <MessageThread
                  conversationId={selectedConversationId}
                  currentUserId={currentUserId}
                  otherParty={conversationData.otherParty}
                  vehicle={conversationData.vehicle}
                  booking={conversationData.booking}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

