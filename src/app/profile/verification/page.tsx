'use client';

import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Clock, Camera, AlertCircle } from 'lucide-react';

interface Document {
  id: string;
  type: 'LICENSE' | 'NATIONAL_ID' | 'PASSPORT' | 'SELFIE' | 'PROOF_OF_ADDRESS';
  status: 'NOT_UPLOADED' | 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  fileUrl?: string;
  rejectionReason?: string;
  uploadedAt?: string;
  reviewedAt?: string;
}

export default function RenterVerificationPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile/documents', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocument(file, docType);
    }
  };

  const uploadDocument = async (file: File, docType: string) => {
    setUploading(docType);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', docType);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        await fetchDocuments();
        alert('Document uploaded successfully!');
      } else {
        alert('Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const getDocumentStatus = (type: string) => {
    return documents.find(doc => doc.type === type);
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
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4" />
            Under Review
          </span>
        );
      case 'UPLOADED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4" />
            Uploaded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Uploaded
          </span>
        );
    }
  };

  const documentTypes = [
    {
      type: 'LICENSE',
      title: "Driver's License",
      description: 'Upload both front and back of your valid driver\'s license',
      required: true,
      tips: [
        'License must not be expired',
        'All text must be clearly readable',
        'Take photo in good lighting',
        'No glare or shadows',
      ],
    },
    {
      type: 'SELFIE',
      title: 'Selfie Verification',
      description: 'Take a live selfie to verify your identity',
      required: true,
      tips: [
        'Look directly at the camera',
        'Ensure your face is well-lit',
        'Remove sunglasses and hats',
        'Match the photo on your license',
      ],
    },
    {
      type: 'NATIONAL_ID',
      title: 'National ID or Passport',
      description: 'Additional identification document',
      required: false,
      tips: [
        'Must be government-issued',
        'Must be valid and not expired',
        'Clear photo of the entire document',
      ],
    },
    {
      type: 'PROOF_OF_ADDRESS',
      title: 'Proof of Address',
      description: 'Utility bill or bank statement (within 3 months)',
      required: false,
      tips: [
        'Document must be dated within 3 months',
        'Your name and address must be visible',
        'Accepted: utility bills, bank statements',
      ],
    },
  ];

  const approvedCount = documents.filter(d => d.status === 'APPROVED').length;
  const totalRequired = documentTypes.filter(d => d.required).length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Renter Verification</h1>
              <p className="text-gray-600 mt-2">
                Complete verification to unlock all booking features
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-500">
                {approvedCount}/{totalRequired}
              </div>
              <div className="text-sm text-gray-600">Documents Approved</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(approvedCount / totalRequired) * 100}%` }}
            />
          </div>
        </div>

        {/* Verification Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Why verify your account?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Access to instant booking without host approval</li>
                <li>✓ Higher chance of booking acceptance from hosts</li>
                <li>✓ Verified badge on your profile</li>
                <li>✓ Build trust with the ZEMO community</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Document Upload Cards */}
        <div className="space-y-6">
          {documentTypes.map((docType) => {
            const doc = getDocumentStatus(docType.type);
            const isUploading = uploading === docType.type;

            return (
              <div key={docType.type} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {docType.title}
                      </h3>
                      {docType.required && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{docType.description}</p>
                  </div>
                  {doc && getStatusBadge(doc.status)}
                </div>

                {/* Tips */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tips for best results:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {docType.tips.map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Upload Section */}
                {doc?.status === 'REJECTED' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Document Rejected</h4>
                        <p className="text-sm text-red-700 mt-1">{doc.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(!doc || doc.status === 'REJECTED') && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors">
                    <input
                      type="file"
                      id={`upload-${docType.type}`}
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileSelect(e, docType.type)}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor={`upload-${docType.type}`}
                      className="cursor-pointer"
                    >
                      {docType.type === 'SELFIE' ? (
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      ) : (
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      )}
                      <p className="text-gray-700 font-medium mb-1">
                        {isUploading ? 'Uploading...' : 'Click to upload'}
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG or PDF up to 10MB
                      </p>
                    </label>
                  </div>
                )}

                {doc && doc.status !== 'REJECTED' && doc.fileUrl && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Document Uploaded</p>
                          <p className="text-sm text-gray-500">
                            {doc.uploadedAt && new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {doc.status !== 'APPROVED' && (
                        <button
                          onClick={() => document.getElementById(`upload-${docType.type}`)?.click()}
                          className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          Re-upload
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Steps */}
        {approvedCount === totalRequired && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Your account is fully verified!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You can now book any vehicle instantly without waiting for host approval.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
