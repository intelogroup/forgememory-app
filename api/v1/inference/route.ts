import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  try {
    const body = await request.json()
    const response = await fetch(`${API_URL}/v1/inference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') ? { 'Authorization': request.headers.get('authorization')! } : {})
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to inference server' }, { status: 500 })
  }
}
