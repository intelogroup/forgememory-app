import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgememo',
  description: 'AI-powered memory for your agents',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
