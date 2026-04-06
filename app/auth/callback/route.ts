import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const source = request.nextUrl.searchParams.get('source')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If this is a CLI login, redirect back to the CLI callback server.
  if (source === 'cli') {
    const cliCallback = request.cookies.get('cli_callback')?.value
    const cliState = request.cookies.get('cli_state')?.value
    if (cliCallback && cliState) {
      const dest = new URL(cliCallback)
      dest.searchParams.set('token', token)
      dest.searchParams.set('state', cliState)
      const response = NextResponse.redirect(dest)
      response.cookies.set('fm_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
      response.cookies.delete('cli_callback')
      response.cookies.delete('cli_state')
      return response
    }
    // No CLI cookie — fall through to billing page
    const response = NextResponse.redirect(new URL('/billing?source=cli', request.url))
    response.cookies.set('fm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    return response
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  response.cookies.set('fm_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
