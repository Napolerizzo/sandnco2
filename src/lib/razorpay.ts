import crypto from 'crypto'

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const key = process.env.RAZORPAY_KEY_SECRET
  if (!key) throw new Error('RAZORPAY_KEY_SECRET is not configured')
  const body = `${orderId}|${paymentId}`
  const expected = crypto.createHmac('sha256', key).update(body).digest('hex')
  return expected === signature
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured')
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return expected === signature
}

export async function createOrder(amount: number, currency = 'INR', notes = {}) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new Error('Razorpay credentials are not configured')

  const Razorpay = (await import('razorpay')).default
  const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })

  return rzp.orders.create({
    amount: Math.round(amount * 100), // paise
    currency,
    notes,
  })
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if ((window as unknown as Record<string, unknown>).Razorpay) return resolve(true)

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
