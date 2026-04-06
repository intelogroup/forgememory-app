'use client'
import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

// This page is opened by `forge login --purchase` after a successful CLI login.
// It stores the cli_callback and state in sessionStorage so the billing/success
// page can call back to the CLI after payment.
function CliSetupInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const cliCallback = searchParams.get('cli_callback')
  const state = searchParams.get('state')

  useEffect(() => {
    if (cliCallback) {
      sessionStorage.setItem('cli_callback', cliCallback)
    }
    if (state) {
      sessionStorage.setItem('cli_state', state)
    }
    // Redirect to the billing page with source=cli and the token in cookie.
    // The token was already set in the fm_token cookie during login.
    router.replace('/billing?source=cli')
  }, [token, cliCallback, state, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted text-sm">Setting up payment...</p>
    </div>
  )
}

export default function CliSetupPage() {
  return (
    <Suspense>
      <CliSetupInner />
    </Suspense>
  )
}
