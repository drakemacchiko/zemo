'use client';

import { useState, useEffect } from 'react';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  sender: {
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface SupportTicketInterfaceProps {
  onCreateTicket?: () => void;
}

export function SupportTicketInterface({ onCreateTicket }: SupportTicketInterfaceProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/support/tickets', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }

      const data = await response.json();
      setSelectedTicket(data.ticket);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load ticket details');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending || !selectedTicket) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          isInternal: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      // Refresh ticket details to show the new message
      fetchTicketDetails(selectedTicket.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'urgent':
        return 'bg-red-400';
      case 'high':
        return 'bg-orange-400';
      case 'normal':
        return 'bg-yellow-400';
      case 'low':
        return 'bg-green-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="animate-pulse h-6 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <button
          onClick={onCreateTicket}
          className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 font-medium"
        >
          Create New Ticket
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchTickets} className="mt-2 text-red-800 hover:text-red-900 underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Your Tickets</h2>
          </div>

          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
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
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p>No support tickets</p>
                <p className="text-sm">Create a ticket if you need help</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => fetchTicketDetails(ticket.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-yellow-50 border-r-2 border-yellow-400'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}
                      />
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900 font-medium truncate">{ticket.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">{ticket.category.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details */}
        {selectedTicket ? (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedTicket.ticketNumber}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedTicket.subject}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTicket.priority)}`}
                  />
                  <span
                    className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}
                  >
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 max-h-64 overflow-y-auto">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">{selectedTicket.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Created {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                <div className="space-y-4">
                  {selectedTicket.messages.map(message => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.isInternal ? 'bg-blue-50 border-l-2 border-blue-400' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender.profile
                            ? `${message.sender.profile.firstName} ${message.sender.profile.lastName}`
                            : 'Support'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border flex items-center justify-center">
            <div className="text-center text-gray-500 py-12">
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p>Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
