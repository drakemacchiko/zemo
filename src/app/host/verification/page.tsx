'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  CreditCard,
  Car,
  Shield,
  Building,
  AlertCircle,
  Eye
} from 'lucide-react'

interface Document {
  id: string
  documentType: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  uploadedAt: string
  verified: boolean
  verificationStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

const HOST_DOCUMENT_TYPES = [
  {
    type: 'national_id',
    label: 'National ID',
    icon: CreditCard,
    description: 'Government-issued ID or passport',
    required: true
  },
  {
    type: 'drivers_license',
    label: "Driver's License",
    icon: CreditCard,
    description: 'Valid driving license (front and back)',
    required: true
  },
  {
    type: 'vehicle_registration',
    label: 'Vehicle Registration',
    icon: Car,
    description: 'Registration certificate for each vehicle',
    required: true
  },
  {
    type: 'insurance_policy',
    label: 'Insurance Policy',
    icon: Shield,
    description: 'Valid vehicle insurance documents',
    required: true
  },
  {
    type: 'proof_of_ownership',
    label: 'Proof of Ownership',
    icon: FileText,
    description: 'Vehicle title or ownership documents',
    required: true
  },
  {
    type: 'bank_details',
    label: 'Bank Account Details',
    icon: Building,
    description: 'For receiving payments',
    required: false
  }
]

export default function HostVerificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedType, setSelectedType] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/documents/upload?category=host', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedType(docType)
      handleUpload(file, docType)
    }
  }

  const handleUpload = async (file: File, docType: string) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', docType)
      formData.append('category', 'host')

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const data = await response.json()
        // Add the new document to the list
        setDocuments(prev => [...prev, data.document])
        setSelectedType('')
        setTimeout(() => setUploadProgress(0), 1000)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const getDocumentForType = (type: string) => {
    return documents.find(doc => doc.documentType === type)
  }

  const getVerificationStatus = () => {
    const requiredTypes = HOST_DOCUMENT_TYPES.filter(dt => dt.required).map(dt => dt.type)
    const uploadedRequiredDocs = requiredTypes.filter(type => 
      documents.some(doc => doc.documentType === type)
    )
    const verifiedRequiredDocs = requiredTypes.filter(type =>
      documents.some(doc => doc.documentType === type && doc.verified)
    )

    return {
      total: requiredTypes.length,
      uploaded: uploadedRequiredDocs.length,
      verified: verifiedRequiredDocs.length,
      percentage: Math.round((verifiedRequiredDocs.length / requiredTypes.length) * 100)
    }
  }

  const status = getVerificationStatus()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading verification status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Host Verification</h1>
          <p className="text-gray-600">
            Upload required documents to verify your identity and start hosting
          </p>
        </div>

        {/* Verification Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Verification Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{status.percentage}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${status.percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{status.total}</p>
              <p className="text-sm text-gray-600">Required</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{status.uploaded}</p>
              <p className="text-sm text-gray-600">Uploaded</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{status.verified}</p>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </div>

          {status.verified === status.total && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Verification Complete!</p>
                <p className="text-sm text-green-700">
                  Your account is fully verified. You can now list vehicles.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Document Upload Cards */}
        <div className="space-y-4">
          {HOST_DOCUMENT_TYPES.map((docType) => {
            const doc = getDocumentForType(docType.type)
            const Icon = docType.icon

            return (
              <div
                key={docType.type}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      doc?.verified 
                        ? 'bg-green-100' 
                        : doc 
                        ? 'bg-yellow-100' 
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        doc?.verified 
                          ? 'text-green-600' 
                          : doc 
                          ? 'text-yellow-600' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {docType.label}
                        </h3>
                        {docType.required && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{docType.description}</p>

                      {doc ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {doc.verified ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600">Verified</span>
                              </>
                            ) : doc.verificationStatus === 'rejected' ? (
                              <>
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-red-600">Rejected</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-600">
                                  Under Review
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>{doc.fileName}</span>
                            <span className="text-gray-400">
                              ({(doc.fileSize / 1024).toFixed(0)} KB)
                            </span>
                          </div>

                          {doc.verificationStatus === 'rejected' && doc.rejectionReason && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800">{doc.rejectionReason}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Not uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {doc && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View document"
                      >
                        <Eye className="h-5 w-5" />
                      </a>
                    )}
                    
                    <label
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                        uploading && selectedType === docType.type
                          ? 'bg-gray-300 cursor-not-allowed'
                          : doc
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {uploading && selectedType === docType.type
                          ? `${uploadProgress}%`
                          : doc
                          ? 'Replace'
                          : 'Upload'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={(e) => handleFileSelect(e, docType.type)}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Document Guidelines:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Upload clear, legible photos or scans</li>
                <li>All documents must be current and not expired</li>
                <li>Accepted formats: JPEG, PNG, PDF</li>
                <li>Maximum file size: 10MB</li>
                <li>Verification typically takes 1-2 business days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
