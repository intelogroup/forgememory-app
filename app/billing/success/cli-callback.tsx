'use client'
import { useEffect, useRef, useState } from 'react'

export default function CliCallback({ apiKey, source }: { apiKey: string; source?: string }) {
  const [status, setStatus] = useState<'pending' | 'done' | 'fallback'>('pending')
  const called = useRef(false)

  useEffect(() => {
    if (source !== 'cli') {
      setStatus('done')
      return
    }
    // Guard against React strict mode double-invoke in dev
    if (called.current) return
    called.current = true

    // cli_callback and cli_state are stored by /billing/cli-setup in sessionStorage
    const cliCallback = sessionStorage.getItem('cli_callback')
    const cliState = sessionStorage.getItem('cli_state')
    if (!cliCallback) {
      setStatus('fallback')
      return
    }
    const dest = new URL(cliCallback)
    if (cliState) dest.searchParams.set('state', cliState)
    fetch(dest.toString())
      .then(r => {
        if (r.ok) setStatus('done')
        else setStatus('fallback')
      })
      .catch(() => setStatus('fallback'))

    sessionStorage.removeItem('cli_callback')
    sessionStorage.removeItem('cli_state')
    localStorage.removeItem('forge_source')
    localStorage.removeItem('forge_token')
  }, [apiKey, source])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg px-6 py-8 bg-card border border-border rounded-lg">
        <div className="text-brand text-xl font-bold mb-2">Payment successful</div>

        {source === 'cli' && status === 'pending' && (
          <p className="text-muted text-sm mb-4">Activating your CLI...</p>
        )}

        {source === 'cli' && status === 'done' && (
          <p className="text-sm mb-4">
            <span className="text-brand font-medium">Done.</span>{' '}
            Return to your terminal — forge is ready.
          </p>
        )}

        {(source !== 'cli' || status === 'fallback') && (
          <>
            <p className="text-muted text-sm mb-3">
              {status === 'fallback'
                ? 'Could not reach the CLI automatically. Run this command instead:'
                : 'Your API key:'}
            </p>
            <code className="block bg-background border border-border rounded px-3 py-2 text-xs text-white mb-4 break-all">
              {status === 'fallback' ? `forge login --api-key ${apiKey}` : apiKey}
            </code>
          </>
        )}

        <a href="/dashboard" className="text-brand text-sm hover:underline">
          Go to dashboard
        </a>
      </div>
    </div>
  )
}
