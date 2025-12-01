'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Camera,
  X,
  Loader2,
  Calendar,
  User,
  Shield,
} from 'lucide-react';

type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';

interface Document {
  id?: string;
  type: 'DRIVERS_LICENSE' | 'ID_CARD' | 'PROOF_OF_ADDRESS';
  frontImageUrl?: string;
  backImageUrl?: string;
  documentNumber?: string;
  expiryDate?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  verifiedAt?: string;
}

interface UserDocuments {
  driversLicense?: Document;
  idCard?: Document;
  proofOfAddress?: Document;
}

export default function DocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<UserDocuments>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<Document['type'] | null>(null);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState('');

  // Fetch user documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/profile/documents', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents || {});
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Handle file selection
  const handleFileChange = (file: File | null, side: 'front' | 'back') => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(reader.result as string);
      } else {
        setBackImage(file);
        setBackPreview(reader.result as string);
      }
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Open upload modal
  const openUploadModal = (docType: Document['type']) => {
    setSelectedDocType(docType);
    setFrontImage(null);
    setBackImage(null);
    setFrontPreview('');
    setBackPreview('');
    setDocumentNumber('');
    setExpiryDate('');
    setError('');
    setShowUploadModal(true);
  };

  // Submit document
  const handleSubmit = async () => {
    if (!selectedDocType) return;

    if (!frontImage) {
      setError('Front image is required');
      return;
    }

    if (selectedDocType === 'DRIVERS_LICENSE' && !backImage) {
      setError('Back image is required for driver\'s license');
      return;
    }

    if (!documentNumber.trim()) {
      setError('Document number is required');
      return;
    }

    if (!expiryDate) {
      setError('Expiry date is required');
      return;
    }

    // Check if expired
    if (new Date(expiryDate) < new Date()) {
      setError('Document has expired');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('documentType', selectedDocType);
      formData.append('frontImage', frontImage);
      if (backImage) formData.append('backImage', backImage);
      formData.append('documentNumber', documentNumber.trim());
      formData.append('expiryDate', expiryDate);

      const response = await fetch('/api/profile/documents/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Update local state
      setDocuments((prev) => ({
        ...prev,
        [selectedDocType === 'DRIVERS_LICENSE'
          ? 'driversLicense'
          : selectedDocType === 'ID_CARD'
          ? 'idCard'
          : 'proofOfAddress']: data.document,
      }));

      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Not Submitted
          </span>
        );
    }
  };

  // Document card component
  const DocumentCard = ({
    title,
    description,
    icon: Icon,
    document,
    docType,
  }: {
    title: string;
    description: string;
    icon: any;
    document?: Document;
    docType: Document['type'];
  }) => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-zemo-yellow transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {document && getStatusBadge(document.status)}
      </div>

      {document && document.frontImageUrl && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-600 mb-2">Front</p>
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={document.frontImageUrl}
                alt="Document front"
                fill
                className="object-cover"
              />
            </div>
          </div>
          {document.backImageUrl && (
            <div>
              <p className="text-xs text-gray-600 mb-2">Back</p>
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={document.backImageUrl}
                  alt="Document back"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {document && document.status === 'REJECTED' && document.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700">{document.rejectionReason}</p>
            </div>
          </div>
        </div>
      )}

      {document && document.documentNumber && (
        <div className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Document Number:</span>
            <span className="font-medium text-gray-900">{document.documentNumber}</span>
          </div>
          {document.expiryDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium text-gray-900">
                {new Date(document.expiryDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => openUploadModal(docType)}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          document && document.status === 'VERIFIED'
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-zemo-yellow text-gray-900 hover:bg-yellow-400'
        }`}
      >
        {document && document.status === 'VERIFIED'
          ? 'Update Document'
          : document && document.status === 'PENDING'
          ? 'Update Submission'
          : 'Upload Document'}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zemo-yellow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zemo-yellow rounded-xl">
              <Shield className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
              <p className="text-sm text-gray-600">
                Upload your documents to rent vehicles on ZEMO
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Why do we need this?
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Verify your identity and age (21+ to rent vehicles)</li>
                <li>• Ensure you have a valid driver's license</li>
                <li>• Protect our host community from fraud</li>
                <li>• Review typically takes 24-48 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Document Cards */}
        <div className="space-y-6">
          {documents.driversLicense ? (
            <DocumentCard
              title="Driver's License"
              description="Required to rent vehicles"
              icon={FileText}
              document={documents.driversLicense}
              docType="DRIVERS_LICENSE"
            />
          ) : (
            <DocumentCard
              title="Driver's License"
              description="Required to rent vehicles"
              icon={FileText}
              docType="DRIVERS_LICENSE"
            />
          )}

          {documents.idCard ? (
            <DocumentCard
              title="National ID Card"
              description="Additional identification (optional)"
              icon={User}
              document={documents.idCard}
              docType="ID_CARD"
            />
          ) : (
            <DocumentCard
              title="National ID Card"
              description="Additional identification (optional)"
              icon={User}
              docType="ID_CARD"
            />
          )}

          {documents.proofOfAddress ? (
            <DocumentCard
              title="Proof of Address"
              description="Utility bill or bank statement (optional)"
              icon={FileText}
              document={documents.proofOfAddress}
              docType="PROOF_OF_ADDRESS"
            />
          ) : (
            <DocumentCard
              title="Proof of Address"
              description="Utility bill or bank statement (optional)"
              icon={FileText}
              docType="PROOF_OF_ADDRESS"
            />
          )}
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Your data is secure</h3>
              <p className="text-xs text-gray-600">
                All documents are encrypted and stored securely. We never share your personal
                information with third parties without your consent.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedDocType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                Upload{' '}
                {selectedDocType === 'DRIVERS_LICENSE'
                  ? "Driver's License"
                  : selectedDocType === 'ID_CARD'
                  ? 'ID Card'
                  : 'Proof of Address'}
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Front Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Front Image <span className="text-red-500">*</span>
                </label>
                {frontPreview ? (
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={frontPreview}
                      alt="Front preview"
                      width={600}
                      height={400}
                      className="w-full"
                    />
                    <button
                      onClick={() => {
                        setFrontImage(null);
                        setFrontPreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-zemo-yellow hover:bg-gray-50 transition-colors">
                    <Camera className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload front image</span>
                    <span className="text-xs text-gray-500 mt-1">Max 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'front')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Back Image */}
              {selectedDocType === 'DRIVERS_LICENSE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back Image <span className="text-red-500">*</span>
                  </label>
                  {backPreview ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={backPreview}
                        alt="Back preview"
                        width={600}
                        height={400}
                        className="w-full"
                      />
                      <button
                        onClick={() => {
                          setBackImage(null);
                          setBackPreview('');
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-zemo-yellow hover:bg-gray-50 transition-colors">
                      <Camera className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload back image</span>
                      <span className="text-xs text-gray-500 mt-1">Max 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'back')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Document Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Enter document number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Photo Tips:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Ensure the entire document is visible</li>
                  <li>• Use good lighting - avoid shadows and glare</li>
                  <li>• Take photos on a plain background</li>
                  <li>• Make sure all text is clear and readable</li>
                  <li>• Don't edit or crop the images</li>
                </ul>
              </div>
            </div>

            {/* Form Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zemo-yellow hover:bg-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Submit Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
