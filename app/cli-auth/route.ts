import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const callback = request.nextUrl.searchParams.get('callback')
  const state = request.nextUrl.searchParams.get('state')

  if (!callback || !state) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.redirect(new URL('/login?source=cli', request.url))
  response.cookies.set('cli_callback', callback, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  })
  response.cookies.set('cli_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return response
}
