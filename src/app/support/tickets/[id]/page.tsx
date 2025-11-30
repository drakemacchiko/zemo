'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  MessageCircle,
  Paperclip,
  Send,
  X,
  User,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  attachments: string[];
  bookingId?: string;
  bookingNumber?: string;
}

interface Message {
  id: string;
  sender: {
    name: string;
    isStaff: boolean;
  };
  message: string;
  attachments: string[];
  createdAt: string;
}

// Mock data - replace with actual API calls
const mockTicket: Ticket = {
  id: '1',
  ticketNumber: 'ZEMO-T-12345',
  subject: 'Payment issue with booking',
  description: 'I was charged twice for my booking. The first payment went through successfully, but I received a second charge on my card statement. Please help me resolve this.',
  category: 'Payment Problem',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  createdAt: '2025-11-28T10:30:00Z',
  updatedAt: '2025-11-29T14:20:00Z',
  attachments: ['receipt-1.pdf', 'bank-statement.pdf'],
  bookingId: 'booking-123',
  bookingNumber: 'ZEMO-B-98765',
};

const mockMessages: Message[] = [
  {
    id: '1',
    sender: { name: 'Support Team', isStaff: true },
    message: 'Hello! Thank you for reaching out. We have received your payment issue report and are investigating. Could you please confirm the exact amounts of both charges?',
    attachments: [],
    createdAt: '2025-11-28T11:00:00Z',
  },
  {
    id: '2',
    sender: { name: 'John Doe', isStaff: false },
    message: 'Yes, both charges were for ZMW 450.00. The first one appeared immediately after booking, and the second one showed up about 2 hours later.',
    attachments: [],
    createdAt: '2025-11-28T14:30:00Z',
  },
  {
    id: '3',
    sender: { name: 'Support Team', isStaff: true },
    message: 'Thank you for confirming. I can see the duplicate charge in our system. This was a processing error on our end. I have initiated a refund for the duplicate charge of ZMW 450.00. You should see it in your account within 5-7 business days. We sincerely apologize for the inconvenience.',
    attachments: ['refund-confirmation.pdf'],
    createdAt: '2025-11-29T09:15:00Z',
  },
];

const statusConfig = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  WAITING_FOR_USER: { label: 'Waiting for You', color: 'bg-orange-100 text-orange-800', icon: MessageCircle },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const [replyMessage, setReplyMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  // TODO: Replace with actual API call
  // const ticket = await getTicket(params.id);
  // const messages = await getTicketMessages(params.id);
  const ticket = mockTicket;
  const messages = mockMessages;
  
  // Use params.id when implementing real API calls
  void params.id; // Suppress unused warning

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() && attachments.length === 0) return;

    setIsSending(true);
    // TODO: Implement API call
    // await sendTicketMessage(params.id, { message: replyMessage, attachments });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setReplyMessage('');
    setAttachments([]);
    setIsSending(false);
  };

  const handleMarkResolved = async () => {
    // TODO: Implement API call
    // await updateTicketStatus(params.id, 'RESOLVED');
    // console.log('Mark as resolved');
  };

  const handleReopen = async () => {
    // TODO: Implement API call
    // await updateTicketStatus(params.id, 'OPEN');
    // console.log('Reopen ticket');
  };

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

  const StatusIcon = statusConfig[ticket.status].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/support" className="text-gray-500 hover:text-gray-700">Support</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/support/tickets" className="text-gray-500 hover:text-gray-700">My Tickets</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{ticket.ticketNumber}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Ticket Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[ticket.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[ticket.status].label}
                    </span>
                    {ticket.priority !== 'NORMAL' && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ticket.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.priority}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created {new Date(ticket.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Updated {getTimeAgo(ticket.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Original Message</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{ticket.description}</p>
                
                {ticket.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Attachments:</h4>
                    {ticket.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <Paperclip className="w-4 h-4" />
                        <a href="#" className="hover:underline">{attachment}</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages Thread */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Conversation</h2>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 ${message.sender.isStaff ? '' : 'flex-row-reverse'}`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.sender.isStaff ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {message.sender.isStaff ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className={`flex-1 ${message.sender.isStaff ? '' : 'text-right'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{message.sender.name}</span>
                        {message.sender.isStaff && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Staff</span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className={`inline-block px-4 py-3 rounded-lg ${
                        message.sender.isStaff 
                          ? 'bg-blue-50 text-gray-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="leading-relaxed">{message.message}</p>
                      </div>
                      {message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                              <Paperclip className="w-4 h-4" />
                              <a href="#" className="hover:underline">{attachment}</a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            {ticket.status !== 'CLOSED' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Reply</h3>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={5}
                />
                
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Paperclip className="w-4 h-4" />
                          <span>{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                    <Paperclip className="w-5 h-5" />
                    <span>Attach Files</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleSendReply}
                    disabled={isSending || (!replyMessage.trim() && attachments.length === 0)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSending ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Details</h3>
              
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="text-sm text-gray-900 mt-1">{ticket.category}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="text-sm text-gray-900 mt-1">{ticket.priority}</dd>
                </div>

                {ticket.bookingId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Related Booking</dt>
                    <dd className="text-sm mt-1">
                      <Link href={`/dashboard/bookings/${ticket.bookingId}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                        {ticket.bookingNumber}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 pt-6 border-t space-y-3">
                {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
                  <button
                    onClick={handleReopen}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Reopen Ticket
                  </button>
                ) : (
                  <button
                    onClick={handleMarkResolved}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Mark as Resolved
                  </button>
                )}
                
                <Link
                  href="/support"
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Browse Help Center
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Need Urgent Help?</h4>
                <div className="space-y-2 text-sm">
                  <a href="tel:+260XXXXXXXXX" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      📞
                    </div>
                    <span>Call: +260 XXX XXXXXX</span>
                  </a>
                  <a href="mailto:support@zemo.zm" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      📧
                    </div>
                    <span>Email Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
