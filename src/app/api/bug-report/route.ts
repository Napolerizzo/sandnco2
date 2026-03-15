import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, description, url, userEmail } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
      console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars')
      return NextResponse.json(
        { error: 'Bug reporting is not configured' },
        { status: 500 }
      )
    }

    const time = new Date().toISOString()
    const message = `🐛 Bug Report\nTitle: ${title}\nDesc: ${description}\nURL: ${url || 'N/A'}\nUser: ${userEmail || 'Anonymous'}\nTime: ${time}`

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    if (!telegramRes.ok) {
      const errBody = await telegramRes.text()
      console.error('Telegram API error:', errBody)
      return NextResponse.json(
        { error: 'Failed to send bug report' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bug report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
