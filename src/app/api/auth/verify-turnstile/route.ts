import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  if (!token) {
    return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 })
  }

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // Dev mode: skip validation
    return NextResponse.json({ success: true })
  }

  const formData = new FormData()
  formData.append('secret', secret)
  formData.append('response', token)
  formData.append('remoteip', req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '')

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    return NextResponse.json({ success: data.success })
  } catch {
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
