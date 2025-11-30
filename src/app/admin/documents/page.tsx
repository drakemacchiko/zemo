'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface Document {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export default function AdminDocumentVerificationPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const url =
        filter === 'ALL' ? '/api/admin/documents' : `/api/admin/documents?status=${filter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (documentId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/documents/${documentId}/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'APPROVE' }),
      });

      if (response.ok) {
        alert('Document approved successfully');
        fetchDocuments();
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Failed to approve document');
    }
  };

  const handleReject = async (documentId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/documents/${documentId}/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'REJECT',
          reason: rejectionReason,
        }),
      });

      if (response.ok) {
        alert('Document rejected');
        fetchDocuments();
        setSelectedDoc(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      alert('Failed to reject document');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Review
          </span>
        );
    }
  };

  const pendingCount = documents.filter(d => d.status === 'UNDER_REVIEW').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
              <p className="text-gray-600 mt-2">Review and approve user-submitted documents</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-500">{pendingCount}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'PENDING'
                  ? 'Pending Review'
                  : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {doc.type.replace('_', ' ')}
                      </h3>
                      {getStatusBadge(doc.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        User: {doc.user.name} ({doc.user.email})
                      </p>
                      <p>Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</p>
                      <p>Filename: {doc.fileName}</p>
                      {doc.rejectionReason && (
                        <p className="text-red-600">Rejection Reason: {doc.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {doc.status === 'UNDER_REVIEW' && (
                      <>
                        <button
                          onClick={() => handleApprove(doc.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Document</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this document. The user will see this message.
              </p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g., Image is blurry, document is expired, etc."
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedDoc.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

