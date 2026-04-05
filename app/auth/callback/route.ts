import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const source = request.nextUrl.searchParams.get('source')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const dest = source === 'cli'
    ? new URL('/billing?source=cli', request.url)
    : new URL('/dashboard', request.url)

  const response = NextResponse.redirect(dest)
  response.cookies.set('fm_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return response
}
