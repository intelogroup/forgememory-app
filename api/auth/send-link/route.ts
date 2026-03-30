import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  try {
    const body = await request.json()
    const callbackUrl = request.nextUrl.origin + '/auth/callback'
    
    const response = await fetch(`${API_URL}/webapp-auth/send-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, callback_url: callbackUrl })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to send link: ${response.status}`)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
  }
}
