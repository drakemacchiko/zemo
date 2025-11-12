'use client'

import { useState, useEffect } from 'react'

export default function ClaimDetailPage({ params }: { params: { id: string } }) {
  const [claim, setClaim] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClaim()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClaim = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const res = await fetch(`/api/claims/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setClaim(data.claim)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow" /></div>
  if (!claim) return <div className="min-h-screen flex items-center justify-center"><p>Claim not found</p></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-6">Claim Details</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
              claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {claim.status}
            </span>
          </div>
          <h2 className="font-bold text-xl mb-2">Claim #{claim.id}</h2>
          <p className="text-gray-600 mb-4">{claim.description}</p>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Submitted: {new Date(claim.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
