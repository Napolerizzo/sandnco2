'use client'

import { useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { initPostHog, track, EVENTS } from '@/lib/posthog'

export default function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    track(EVENTS.PAGE_VIEW, { path: pathname })
  }, [pathname])

  return <>{children}</>
}
