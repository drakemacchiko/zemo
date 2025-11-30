'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Filter, Clock, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  unreadMessages: number;
}

// Mock data - replace with actual API call
const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'ZEMO-T-12345',
    subject: 'Payment issue with booking',
    category: 'Payment Problem',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: '2025-11-28T10:30:00Z',
    updatedAt: '2025-11-28T14:20:00Z',
    unreadMessages: 2,
  },
  {
    id: '2',
    ticketNumber: 'ZEMO-T-12344',
    subject: 'Question about insurance coverage',
    category: 'Insurance Claim',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    createdAt: '2025-11-27T09:15:00Z',
    updatedAt: '2025-11-29T16:45:00Z',
    unreadMessages: 0,
  },
  {
    id: '3',
    ticketNumber: 'ZEMO-T-12343',
    subject: 'Vehicle not as described',
    category: 'Booking Issue',
    status: 'RESOLVED',
    priority: 'NORMAL',
    createdAt: '2025-11-25T13:20:00Z',
    updatedAt: '2025-11-26T11:30:00Z',
    unreadMessages: 0,
  },
];

const statusConfig = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  WAITING_FOR_USER: { label: 'Waiting for You', color: 'bg-orange-100 text-orange-800', icon: MessageCircle },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

const priorityConfig = {
  LOW: { color: 'text-gray-600' },
  NORMAL: { color: 'text-blue-600' },
  HIGH: { color: 'text-orange-600' },
  URGENT: { color: 'text-red-600' },
};

export default function TicketsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const filteredTickets = mockTickets.filter(ticket => {
    if (filterStatus === 'all') return true;
    return ticket.status === filterStatus;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Support Tickets</h1>
              <p className="text-xl text-blue-100">Track and manage your support requests</p>
            </div>
            <Link
              href="/support/contact"
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filter by Status</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tickets
            </button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Support Tickets</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? "You haven't submitted any support tickets yet."
                  : `You don't have any ${statusConfig[filterStatus as keyof typeof statusConfig]?.label.toLowerCase()} tickets.`
                }
              </p>
              <Link
                href="/support/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus className="w-5 h-5" />
                Submit Your First Ticket
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const StatusIcon = statusConfig[ticket.status].icon;
              return (
                <Link
                  key={ticket.id}
                  href={`/support/tickets/${ticket.id}`}
                  className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[ticket.status].color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[ticket.status].label}
                        </span>
                        {ticket.priority !== 'NORMAL' && (
                          <span className={`text-xs font-medium ${priorityConfig[ticket.priority].color}`}>
                            {ticket.priority}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">Category:</span> {ticket.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Updated {getTimeAgo(ticket.updatedAt)}
                        </span>
                      </div>
                    </div>
                    {ticket.unreadMessages > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        <MessageCircle className="w-4 h-4" />
                        {ticket.unreadMessages} new {ticket.unreadMessages === 1 ? 'message' : 'messages'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      Created {new Date(ticket.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="text-blue-600 text-sm font-medium group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Something Else?</h3>
          <p className="text-gray-600 mb-6">Browse our help center or get in touch with our support team</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/support"
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Browse Help Center
            </Link>
            <a
              href="tel:+260XXXXXXXXX"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Call Support: +260 XXX XXXXXX
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
