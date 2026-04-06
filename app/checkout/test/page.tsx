'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Dev-mode test checkout page. Simulates a successful Stripe payment.
// In production, Stripe handles this and sends the user to /billing/success.
function CheckoutTestInner() {
  const searchParams = useSearchParams()
  const packId = searchParams.get('pack_id') ?? 'pack_5'
  const credits = searchParams.get('credits') ?? '1000'
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleConfirm() {
    setStatus('loading')
    // Simulate: redirect to billing/success with source=cli
    window.location.href = `/billing/success?source=cli`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm bg-card border border-border rounded-lg p-8">
        <div className="text-brand text-xs uppercase tracking-wide font-medium mb-4">
          Dev Mode — Test Checkout
        </div>
        <div className="text-white text-lg font-semibold mb-1">
          {packId === 'pack_5' ? '$5' : packId === 'pack_20' ? '$20' : '$50'} Credit Pack
        </div>
        <div className="text-muted text-sm mb-6">~{credits} runs</div>
        <button
          onClick={handleConfirm}
          disabled={status === 'loading'}
          className="w-full bg-brand hover:bg-green-700 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {status === 'loading' ? 'Processing...' : 'Confirm Payment'}
        </button>
        <p className="text-subtle text-xs mt-4 text-center">
          No real charge — dev mode only
        </p>
      </div>
    </div>
  )
}

export default function CheckoutTestPage() {
  return (
    <Suspense>
      <CheckoutTestInner />
    </Suspense>
  )
}
