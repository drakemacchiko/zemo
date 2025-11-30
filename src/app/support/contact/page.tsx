'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Upload, X } from 'lucide-react';

const categories = [
  { value: 'BOOKING_ISSUE', label: 'Booking Issue' },
  { value: 'PAYMENT_PROBLEM', label: 'Payment Problem' },
  { value: 'ACCOUNT_ISSUE', label: 'Account Issue' },
  { value: 'VEHICLE_LISTING', label: 'Vehicle Listing' },
  { value: 'INSURANCE_CLAIM', label: 'Insurance/Damage Claim' },
  { value: 'TRUST_SAFETY', label: 'Trust & Safety Report' },
  { value: 'TECHNICAL', label: 'Technical Problem' },
  { value: 'OTHER', label: 'Other' },
];

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    category: 'BOOKING_ISSUE',
    subject: '',
    description: '',
    priority: 'NORMAL' as 'NORMAL' | 'URGENT',
    bookingId: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file size (10MB max per file)
      const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        setError('Some files exceed the 10MB limit');
        return;
      }
      
      // Max 5 files
      if (attachments.length + files.length > 5) {
        setError('Maximum 5 attachments allowed');
        return;
      }
      
      setAttachments([...attachments, ...files]);
      setError(null);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.description.length < 50) {
      setError('Please provide at least 50 characters in your description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('subject', formData.subject);
      submitData.append('description', formData.description);
      submitData.append('priority', formData.priority);
      if (formData.bookingId) {
        submitData.append('bookingId', formData.bookingId);
      }
      
      // Append files
      attachments.forEach(file => {
        submitData.append('attachments', file);
      });

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }

      const result = await response.json();
      
      // Redirect to ticket page
      router.push(`/support/tickets/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Support</h1>
          <p className="text-lg text-gray-600">
            Submit a support request and we'll get back to you within 24 hours
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                What do you need help with? <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Booking ID (optional) */}
            <div>
              <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-2">
                Related Booking ID (if applicable)
              </label>
              <input
                type="text"
                id="bookingId"
                placeholder="e.g., ZEMO-B-12345"
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                If this is about a specific booking, provide the booking ID
              </p>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                placeholder="Brief summary of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={8}
                placeholder="Please provide as much detail as possible about your issue..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum 50 characters • {formData.description.length}/50
              </p>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Max 5 files, 10MB each • Images, PDFs, documents
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Choose Files
                </label>
              </div>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                          <Upload className="text-blue-600" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="flex-shrink-0 text-red-600 hover:text-red-800 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="NORMAL"
                    checked={formData.priority === 'NORMAL'}
                    onChange={() => setFormData({ ...formData, priority: 'NORMAL' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Normal</p>
                    <p className="text-sm text-gray-500">
                      General inquiries and non-urgent issues
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="URGENT"
                    checked={formData.priority === 'URGENT'}
                    onChange={() => setFormData({ ...formData, priority: 'URGENT' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-red-600">Urgent</p>
                    <p className="text-sm text-gray-500">
                      Safety concerns or issues affecting an active trip
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Resources */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            Before submitting, try these resources:
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              • <a href="/support" className="text-blue-600 hover:underline">Search our Help Center</a> for instant answers
            </li>
            <li>
              • Check your <a href="/support/tickets" className="text-blue-600 hover:underline">existing tickets</a> for updates
            </li>
            <li>
              • For emergencies during an active trip, call our 24/7 hotline: <strong>+260 XXX XXXXXX</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
