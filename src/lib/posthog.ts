import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false, // We'll handle manually
    persistence: 'localStorage',
    autocapture: false,
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.opt_out_capturing()
    },
  })
}

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  try { posthog.capture(event, properties) } catch {}
}

export const identifyUser = (userId: string, traits?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  try { posthog.identify(userId, traits) } catch {}
}

export const resetUser = () => {
  if (typeof window === 'undefined') return
  try { posthog.reset() } catch {}
}

// Event constants
export const EVENTS = {
  USER_SIGNUP: 'user_signup',
  EMAIL_VERIFIED: 'email_verified',
  RUMOR_POSTED: 'rumor_posted',
  RUMOR_VOTE: 'rumor_vote',
  CHALLENGE_CREATED: 'challenge_created',
  CHALLENGE_JOINED: 'challenge_joined',
  CHALLENGE_SUBMISSION: 'challenge_submission',
  CHALLENGE_WON: 'challenge_won',
  WALLET_DEPOSIT: 'wallet_deposit',
  WALLET_WITHDRAWAL: 'wallet_withdrawal',
  MEMBERSHIP_PURCHASED: 'membership_purchased',
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  PAGE_VIEW: '$pageview',
} as const
