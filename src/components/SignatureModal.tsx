'use client'

import { useRef, useState, useEffect } from 'react'
import { X, RotateCcw, Check } from 'lucide-react'

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSign: (signatureData: string) => Promise<void>
  signerName: string
  signerType: 'host' | 'renter'
}

export default function SignatureModal({
  isOpen,
  onClose,
  onSign,
  signerName,
  signerType
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Set canvas background to white
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Configure drawing style
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, [isOpen])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? (e.touches[0]?.clientX ?? 0) - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? (e.touches[0]?.clientY ?? 0) - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? (e.touches[0]?.clientX || 0) - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? (e.touches[0]?.clientY || 0) - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and reset background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    setHasDrawn(false)
  }

  const handleSubmit = async () => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return

    setSubmitting(true)
    try {
      // Convert canvas to base64 image
      const signatureData = canvas.toDataURL('image/png')
      await onSign(signatureData)
      onClose()
    } catch (error) {
      console.error('Error submitting signature:', error)
      alert('Failed to submit signature. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Sign Rental Agreement
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {signerType === 'host' ? 'Host' : 'Renter'} Signature Required
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              By signing below, <span className="font-semibold">{signerName}</span>, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>You have read and understood all terms and conditions</li>
              <li>You agree to be bound by this rental agreement</li>
              <li>All information provided is accurate and complete</li>
              <li>This signature is legally binding</li>
            </ul>
          </div>

          {/* Signature Canvas */}
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <p className="text-sm font-medium text-gray-700">
                Draw your signature below
              </p>
            </div>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* Signature Info */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Legal Name:</span> {signerName}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <span className="font-medium">Date & Time:</span>{' '}
              {new Date().toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short'
              })}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <span className="font-medium">IP Address:</span> Will be recorded for verification
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={clearSignature}
            disabled={!hasDrawn || submitting}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Clear</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasDrawn || submitting}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Sign Agreement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
