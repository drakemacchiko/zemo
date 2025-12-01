'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  User,
  FileText,
  AlertCircle,
  Search,
  X,
} from 'lucide-react';

type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

interface VerificationDocument {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'DRIVERS_LICENSE' | 'ID_CARD' | 'PROOF_OF_ADDRESS';
  frontImageUrl: string;
  backImageUrl?: string;
  documentNumber: string;
  expiryDate: string;
  status: DocumentStatus;
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export default function VerificationDashboard() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DocumentStatus | 'ALL'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending verifications
  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const url = `/api/admin/verifications${filter !== 'ALL' ? `?status=${filter}` : ''}`;
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter documents by search term
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // View document details
  const viewDocument = (doc: VerificationDocument) => {
    setSelectedDoc(doc);
    setRejectionReason('');
  };

  // View image in modal
  const viewImage = (url: string) => {
    setModalImage(url);
    setShowImageModal(true);
  };

  // Approve document
  const handleApprove = async (docId: string) => {
    if (!confirm('Approve this document?')) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/verifications/${docId}/approve`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        // Update local state
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === docId
              ? { ...doc, status: 'VERIFIED', verifiedAt: new Date().toISOString() }
              : doc
          )
        );
        setSelectedDoc(null);
      } else {
        alert('Failed to approve document');
      }
    } catch (error) {
      console.error('Approve failed:', error);
      alert('Failed to approve document');
    } finally {
      setProcessing(false);
    }
  };

  // Reject document
  const handleReject = async (docId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!confirm('Reject this document? The user will be notified.')) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/verifications/${docId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });

      if (response.ok) {
        // Update local state
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === docId
              ? {
                  ...doc,
                  status: 'REJECTED',
                  rejectionReason: rejectionReason.trim(),
                  verifiedAt: new Date().toISOString(),
                }
              : doc
          )
        );
        setSelectedDoc(null);
        setRejectionReason('');
      } else {
        alert('Failed to reject document');
      }
    } catch (error) {
      console.error('Reject failed:', error);
      alert('Failed to reject document');
    } finally {
      setProcessing(false);
    }
  };

  // Get document type label
  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case 'DRIVERS_LICENSE':
        return "Driver's License";
      case 'ID_CARD':
        return 'ID Card';
      case 'PROOF_OF_ADDRESS':
        return 'Proof of Address';
      default:
        return type;
    }
  };

  // Get status badge
  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Document Verification Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Review and verify user documents</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-zemo-yellow text-gray-900'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or document number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
            />
          </div>
        </div>

        {/* Documents Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-zemo-yellow" />
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doc.userName}</div>
                          <div className="text-sm text-gray-500">{doc.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getDocTypeLabel(doc.type)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.documentNumber}</div>
                      <div className="text-xs text-gray-500">
                        Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(doc.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(doc.submittedAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(doc.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewDocument(doc)}
                        className="text-zemo-yellow hover:text-yellow-600 font-semibold"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-sm text-gray-600">
              {searchTerm
                ? 'Try adjusting your search'
                : 'No documents match the selected filter'}
            </p>
          </div>
        )}
      </div>

      {/* Document Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Document Review</h2>
                <p className="text-sm text-gray-600">{getDocTypeLabel(selectedDoc.type)}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-xs font-medium text-gray-600">User Name</label>
                  <p className="text-sm font-semibold text-gray-900">{selectedDoc.userName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <p className="text-sm font-semibold text-gray-900">{selectedDoc.userEmail}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Document Number</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedDoc.documentNumber}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Expiry Date</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(selectedDoc.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front Image
                  </label>
                  <div
                    onClick={() => viewImage(selectedDoc.frontImageUrl)}
                    className="relative aspect-[16/10] rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-zemo-yellow transition-colors"
                  >
                    <Image
                      src={selectedDoc.frontImageUrl}
                      alt="Document front"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100" />
                    </div>
                  </div>
                </div>

                {selectedDoc.backImageUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Back Image
                    </label>
                    <div
                      onClick={() => viewImage(selectedDoc.backImageUrl!)}
                      className="relative aspect-[16/10] rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-zemo-yellow transition-colors"
                    >
                      <Image
                        src={selectedDoc.backImageUrl}
                        alt="Document back"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rejection Reason (if status is PENDING) */}
              {selectedDoc.status === 'PENDING' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this document is being rejected..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent resize-none"
                  />
                </div>
              )}

              {/* Status Info */}
              {selectedDoc.status !== 'PENDING' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(selectedDoc.status)}
                    {selectedDoc.verifiedAt && (
                      <span className="text-sm text-gray-600">
                        on {new Date(selectedDoc.verifiedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {selectedDoc.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2">{selectedDoc.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedDoc.status === 'PENDING' && (
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => handleReject(selectedDoc.id)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Reject
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleApprove(selectedDoc.id)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && modalImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <Image
              src={modalImage}
              alt="Document full view"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
