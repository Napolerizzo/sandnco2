export type RankTier =
  | 'ghost_in_the_city'
  | 'street_whisperer'
  | 'rumor_rookie'
  | 'gossip_goblin'
  | 'myth_merchant'
  | 'truth_seeker'
  | 'chaos_agent'
  | 'urban_legend'
  | 'lord_of_vibes'
  | 'king_of_good_times'

export const RANKS: Record<RankTier, {
  label: string
  emoji: string
  color: string
  glowColor: string
  xpRequired: number
  description: string
  perks: string[]
}> = {
  ghost_in_the_city: {
    label: 'Ghost in the City',
    emoji: '👻',
    color: '#6b7280',
    glowColor: 'rgba(107,114,128,0.4)',
    xpRequired: 0,
    description: 'You haunt the streets unseen. The city doesn\'t know you yet.',
    perks: ['Post rumors', 'Join public challenges'],
  },
  street_whisperer: {
    label: 'Street Whisperer',
    emoji: '🤫',
    color: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.4)',
    xpRequired: 100,
    description: 'Lips sealed, eyes open. You know things others don\'t.',
    perks: ['Custom bio', 'Vote on rumors'],
  },
  rumor_rookie: {
    label: 'Rumor Rookie',
    emoji: '📢',
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.4)',
    xpRequired: 500,
    description: 'The city is starting to hear your name. Keep talking.',
    perks: ['Anonymous posting', 'Comment threads'],
  },
  gossip_goblin: {
    label: 'Gossip Goblin',
    emoji: '😈',
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.4)',
    xpRequired: 1500,
    description: 'Chaos incarnate. You thrive in the mayhem of half-truths.',
    perks: ['Custom avatar style', 'Priority feed placement'],
  },
  myth_merchant: {
    label: 'Myth Merchant',
    emoji: '🧪',
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.4)',
    xpRequired: 3000,
    description: 'You trade in legends. Every story has a price.',
    perks: ['Create paid challenges', 'Myth-buster access'],
  },
  truth_seeker: {
    label: 'Truth Seeker',
    emoji: '🔍',
    color: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.4)',
    xpRequired: 6000,
    description: 'The city fears your investigations. You find what\'s buried.',
    perks: ['Investigation tools', 'Verified investigator badge'],
  },
  chaos_agent: {
    label: 'Chaos Agent',
    emoji: '⚡',
    color: '#f97316',
    glowColor: 'rgba(249,115,22,0.4)',
    xpRequired: 12000,
    description: 'You don\'t start fires. You just make sure they spread.',
    perks: ['Challenge judging rights', 'Special chaos badge'],
  },
  urban_legend: {
    label: 'Urban Legend',
    emoji: '🌆',
    color: '#ec4899',
    glowColor: 'rgba(236,72,153,0.4)',
    xpRequired: 25000,
    description: 'They whisper your name in dark corners. You are the story.',
    perks: ['Featured profile slot', 'Premium challenge access'],
  },
  lord_of_vibes: {
    label: 'Lord of Vibes',
    emoji: '👑',
    color: '#a855f7',
    glowColor: 'rgba(168,85,247,0.5)',
    xpRequired: 50000,
    description: 'The city bends to your frequency. Reality is your remix.',
    perks: ['Admin nomination eligible', 'Exclusive vibe board', 'Lord badge'],
  },
  king_of_good_times: {
    label: 'King of Good Times',
    emoji: '🤴',
    color: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.6)',
    xpRequired: 100000,
    description: 'The throne is yours. You don\'t just rule the city — you ARE the vibe.',
    perks: ['All access', 'Crown badge', 'Custom theme', 'Eternal glory'],
  },
}

export function getRankFromXP(xp: number): RankTier {
  if (xp >= 100000) return 'king_of_good_times'
  if (xp >= 50000) return 'lord_of_vibes'
  if (xp >= 25000) return 'urban_legend'
  if (xp >= 12000) return 'chaos_agent'
  if (xp >= 6000) return 'truth_seeker'
  if (xp >= 3000) return 'myth_merchant'
  if (xp >= 1500) return 'gossip_goblin'
  if (xp >= 500) return 'rumor_rookie'
  if (xp >= 100) return 'street_whisperer'
  return 'ghost_in_the_city'
}

export function getXPProgress(xp: number): { current: number; next: number; percent: number } {
  const rank = getRankFromXP(xp)
  const rankData = RANKS[rank]
  const rankKeys = Object.keys(RANKS) as RankTier[]
  const rankIndex = rankKeys.indexOf(rank)

  if (rankIndex === rankKeys.length - 1) {
    return { current: xp, next: rankData.xpRequired, percent: 100 }
  }

  const nextRank = RANKS[rankKeys[rankIndex + 1]]
  const progress = xp - rankData.xpRequired
  const total = nextRank.xpRequired - rankData.xpRequired

  return {
    current: xp,
    next: nextRank.xpRequired,
    percent: Math.min(100, Math.floor((progress / total) * 100)),
  }
}

export type PfpStyle =
  | 'neon_orb'
  | 'pixel_beast'
  | 'glitch_portrait'
  | 'ascii_god'
  | 'geometric_chaos'
  | 'gradient_phantom'
  | 'cyber_mask'
  | 'void_entity'

export const PFP_STYLES: Record<PfpStyle, {
  label: string
  description: string
  gradient: string[]
}> = {
  neon_orb: {
    label: 'Neon Orb',
    description: 'A pulsing sphere of electric light',
    gradient: ['#00f5ff', '#7b2ff7'],
  },
  pixel_beast: {
    label: 'Pixel Beast',
    description: '8-bit chaos in digital form',
    gradient: ['#ff6b6b', '#ffd93d'],
  },
  glitch_portrait: {
    label: 'Glitch Portrait',
    description: 'Reality corrupted. Identity fragmented.',
    gradient: ['#ff0080', '#7928ca'],
  },
  ascii_god: {
    label: 'ASCII God',
    description: 'Pure code, divine form',
    gradient: ['#00ff41', '#003b00'],
  },
  geometric_chaos: {
    label: 'Geometric Chaos',
    description: 'Fractals colliding at the speed of thought',
    gradient: ['#f97316', '#ec4899'],
  },
  gradient_phantom: {
    label: 'Gradient Phantom',
    description: 'Smooth. Spectral. Untouchable.',
    gradient: ['#a855f7', '#3b82f6'],
  },
  cyber_mask: {
    label: 'Cyber Mask',
    description: 'Face hidden. Identity absolute.',
    gradient: ['#06b6d4', '#0284c7'],
  },
  void_entity: {
    label: 'Void Entity',
    description: 'You came from nothing. You return to nothing.',
    gradient: ['#1e1b4b', '#4c1d95'],
  },
}
