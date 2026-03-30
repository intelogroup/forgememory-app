import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  try {
    const authHeader = request.headers.get('authorization')
    const response = await fetch(`${API_URL}/v1/stats`, {
      headers: authHeader ? { 'Authorization': authHeader } : {}
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to server' }, { status: 500 })
  }
}
