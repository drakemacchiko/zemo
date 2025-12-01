'use client';

import React, { useState, useCallback, useRef } from 'react';
import { X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadedDocument {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface DocumentUploaderProps {
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onUpload: (files: File[]) => Promise<string[]>;
  onChange?: (urls: string[]) => void;
  initialUrls?: string[];
  label?: string;
  required?: boolean;
  className?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png'],
  onUpload,
  onChange,
  initialUrls = [],
  label,
  required = false,
  className = '',
}) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialUrls);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const uploadDocuments = useCallback(async (docsToUpload: UploadedDocument[]) => {
    const fileObjects = docsToUpload.map((d) => d.file);

    try {
      setDocuments((prev) =>
        prev.map((d) =>
          docsToUpload.find((du) => du.id === d.id)
            ? { ...d, status: 'uploading' as const }
            : d
        )
      );

      const urls = await onUpload(fileObjects);

      setDocuments((prev) =>
        prev.map((d) => {
          const uploadIndex = docsToUpload.findIndex((du) => du.id === d.id);
          if (uploadIndex !== -1 && urls[uploadIndex]) {
            return {
              ...d,
              status: 'success' as const,
              progress: 100,
              url: urls[uploadIndex]!,
            };
          }
          return d;
        })
      );

      const newUrls = [...uploadedUrls, ...urls];
      setUploadedUrls(newUrls);
      onChange?.(newUrls);

      setTimeout(() => {
        setDocuments((prev) => prev.filter((d) => d.status !== 'success'));
      }, 2000);
    } catch (error) {
      setDocuments((prev) =>
        prev.map((d) =>
          docsToUpload.find((du) => du.id === d.id)
            ? {
                ...d,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : d
        )
      );
    }
  }, [onUpload, uploadedUrls, onChange, setDocuments, setUploadedUrls]);

  const handleFiles = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newDocs: UploadedDocument[] = [];
      const errors: string[] = [];

      Array.from(selectedFiles).forEach((file) => {
        if (documents.length + uploadedUrls.length + newDocs.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          return;
        }

        if (!acceptedTypes.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type`);
          return;
        }

        if (file.size > maxSizeBytes) {
          errors.push(`${file.name}: File too large (max ${maxSizeMB}MB)`);
          return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        newDocs.push({
          id,
          file,
          progress: 0,
          status: 'pending',
        });
      });

      if (errors.length > 0) {
        alert(errors.join('\n'));
      }

      if (newDocs.length > 0) {
        setDocuments((prev) => [...prev, ...newDocs]);
        uploadDocuments(newDocs);
      }
    },
    [documents, uploadedUrls, maxFiles, acceptedTypes, maxSizeBytes, maxSizeMB, uploadDocuments]
  );

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const removeUploadedUrl = (url: string) => {
    const newUrls = uploadedUrls.filter((u) => u !== url);
    setUploadedUrls(newUrls);
    onChange?.(newUrls);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const canAddMore = documents.length + uploadedUrls.length < maxFiles;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">
            Upload Documents
          </p>
          <p className="text-xs text-gray-600 mb-4">
            Drag and drop or click to browse
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Choose Files
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Max {maxFiles} files, {maxSizeMB}MB each • PDF, JPG, PNG
          </p>
        </div>
      )}

      {/* Uploaded Documents */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2 mt-4">
          {uploadedUrls.map((url, index) => (
            <div
              key={url}
              className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Document {index + 1}
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View document
                </a>
              </div>
              <button
                type="button"
                onClick={() => removeUploadedUrl(url)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploading Documents */}
      {documents.length > 0 && (
        <div className="space-y-2 mt-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                doc.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {doc.status === 'uploading' ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              ) : doc.status === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              ) : (
                <span className="text-2xl flex-shrink-0">{getFileIcon(doc.file.type)}</span>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.file.name}
                </p>
                <p className="text-xs text-gray-600">
                  {formatFileSize(doc.file.size)}
                  {doc.status === 'uploading' && ' • Uploading...'}
                  {doc.status === 'error' && ` • ${doc.error}`}
                </p>
              </div>

              {doc.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => removeDocument(doc.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
