'use client';

import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';

interface TaxDocument {
  id: string;
  year: number;
  documentType: string;
  totalEarnings: number;
  generatedAt: string;
  downloadUrl: string;
}

export default function TaxDocumentsPage() {
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxDocuments();
  }, []);

  const fetchTaxDocuments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/host/earnings/tax-documents', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching tax documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/host/earnings/tax-documents/${documentId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tax-document-${documentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Documents</h1>
        <p className="text-gray-600">Download annual earning statements and tax documents</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Tax Information:</strong> Your annual earning statements are generated at the end
          of each tax year. Please consult with a tax professional for guidance on reporting rental
          income.
        </p>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tax documents available</h3>
          <p className="text-gray-600">
            Tax documents will be generated at the end of each tax year
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {doc.documentType} - {doc.year}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Total Earnings:{' '}
                      <span className="font-semibold text-gray-900">
                        ZMW {doc.totalEarnings.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Generated on {new Date(doc.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(doc.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Tax documents are generated automatically at the end of each tax year</li>
          <li>• Documents include all rental income and applicable deductions</li>
          <li>• Contact support if you need a document regenerated</li>
          <li>• Consult with a tax professional for filing guidance</li>
        </ul>
      </div>
    </div>
  );
}
