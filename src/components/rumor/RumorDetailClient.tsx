'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, ArrowLeft, CheckCircle, X, AlertCircle, HelpCircle,
  MessageCircle, Eye, MapPin, ThumbsUp, Reply, Send, Shield,
  ChevronDown, ChevronUp, Zap,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface Rumor {
  id: string
  author_id: string
  anonymous_alias: string
  title: string
  content: string
  category: string
  tags: string[]
  heat_score: number
  verdict: string | null
  verdict_reason: string | null
  status: string
  view_count: number
  is_anonymous: boolean
  city: string | null
  created_at: string
}

interface Vote {
  rumor_id: string
  user_id: string
  vote_type: string
}

interface CommentAuthor {
  username: string
  display_name: string | null
  rank: string | null
  profile_picture_url: string | null
}

interface Comment {
  id: string
  rumor_id: string
  author_id: string
  content: string
  is_anonymous: boolean
  anonymous_alias: string | null
  parent_id: string | null
  upvotes: number
  created_at: string
  users: CommentAuthor | null
}

interface Props {
  rumor: Rumor
  votes: Vote[]
  comments: Comment[]
  userVote: string | null
  userId: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number }> }> = {
  TRUE: { label: 'Confirmed', color: '#22C55E', icon: CheckCircle },
  FALSE: { label: 'Debunked', color: '#EF4444', icon: X },
  MISLEADING: { label: 'Misleading', color: '#F97316', icon: AlertCircle },
  PARTLY_TRUE: { label: 'Partial', color: '#F59E0B', icon: AlertCircle },
  UNPROVEN: { label: 'Unproven', color: '#6B7280', icon: HelpCircle },
}

const CATEGORY_COLORS: Record<string, string> = {
  drama: '#EF4444', politics: '#F59E0B', music: '#A855F7',
  sports: '#22C55E', tech: '#3B82F6', romance: '#EC4899',
  crime: '#F97316', lifestyle: '#6366F1', general: '#6B7280',
}

const VOTE_CONFIG = {
  believe: { label: 'Believe', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', icon: '👍' },
  doubt: { label: 'Doubt', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: '👎' },
  spicy: { label: 'Spicy', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: '🔥' },
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function RumorDetailClient({ rumor, votes: initialVotes, comments: initialComments, userVote: initialUserVote, userId }: Props) {
  const router = useRouter()
  const [votes, setVotes] = useState(initialVotes)
  const [currentVote, setCurrentVote] = useState<string | null>(initialUserVote)
  const [votingInProgress, setVotingInProgress] = useState(false)
  const [comments, setComments] = useState(initialComments)
  const [commentText, setCommentText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyAnonymous, setReplyAnonymous] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  // ── Vote counts ────────────────────────────────────────────────────────
  const voteCounts = useMemo(() => {
    const counts = { believe: 0, doubt: 0, spicy: 0 }
    votes.forEach(v => {
      if (v.vote_type in counts) counts[v.vote_type as keyof typeof counts]++
    })
    return counts
  }, [votes])

  // ── Comment threading ──────────────────────────────────────────────────
  const { topLevel, repliesMap } = useMemo(() => {
    const top: Comment[] = []
    const map: Record<string, Comment[]> = {}
    comments.forEach(c => {
      if (!c.parent_id) {
        top.push(c)
      } else {
        if (!map[c.parent_id]) map[c.parent_id] = []
        map[c.parent_id].push(c)
      }
    })
    return { topLevel: top, repliesMap: map }
  }, [comments])

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleVote = useCallback(async (voteType: string) => {
    if (votingInProgress) return
    setVotingInProgress(true)

    try {
      if (currentVote === voteType) {
        // Remove vote
        await fetch(`/api/rumors/${rumor.id}/vote`, { method: 'DELETE' })
        setVotes(prev => prev.filter(v => !(v.user_id === userId)))
        setCurrentVote(null)
      } else {
        // Upsert vote
        await fetch(`/api/rumors/${rumor.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: voteType }),
        })
        setVotes(prev => {
          const without = prev.filter(v => v.user_id !== userId)
          return [...without, { rumor_id: rumor.id, user_id: userId, vote_type: voteType }]
        })
        setCurrentVote(voteType)
      }
    } catch {
      // Silently fail
    } finally {
      setVotingInProgress(false)
    }
  }, [currentVote, votingInProgress, rumor.id, userId])

  const submitComment = useCallback(async (parentId: string | null, content: string, anonymous: boolean) => {
    if (!content.trim()) return
    setSubmittingComment(true)

    try {
      const res = await fetch(`/api/rumors/${rumor.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), is_anonymous: anonymous, parent_id: parentId }),
      })
      if (res.ok) {
        const { comment } = await res.json()
        setComments(prev => [...prev, comment])
        if (parentId) {
          setReplyingTo(null)
          setReplyText('')
          setExpandedReplies(prev => new Set([...prev, parentId]))
        } else {
          setCommentText('')
        }
      }
    } catch {
      // Silently fail
    } finally {
      setSubmittingComment(false)
    }
  }, [rumor.id])

  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }, [])

  // ── Derived values ─────────────────────────────────────────────────────
  const verdict = rumor.verdict ? VERDICT_CONFIG[rumor.verdict] : null
  const VerdictIcon = verdict?.icon
  const catColor = CATEGORY_COLORS[rumor.category] || '#6B7280'
  const isHot = rumor.heat_score > 50
  const isWarm = rumor.heat_score > 20
  const heatColor = isHot ? '#EF4444' : isWarm ? '#F59E0B' : 'var(--muted)'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 100px' }}>
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        style={{ marginBottom: 20 }}
      >
        <Link href="/rumors" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>
          <ArrowLeft size={14} />
          Back to Rumor Mill
        </Link>
      </motion.div>

      {/* ── Rumor Card ─────────────────────────────────────────────────── */}
      <motion.div
        className="feed-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ padding: '24px', marginBottom: 16 }}
      >
        {/* Heat bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, height: 3,
          background: `linear-gradient(90deg, ${heatColor}, ${heatColor}40, transparent)`,
          width: `${Math.min(100, Math.max(15, rumor.heat_score))}%`,
          borderRadius: '12px 0 0 0',
        }} />

        {/* Top meta row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {rumor.category && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px',
              borderRadius: 100, background: `${catColor}12`,
              border: `1px solid ${catColor}25`, color: catColor,
              textTransform: 'capitalize',
            }}>
              {rumor.category}
            </span>
          )}
          {rumor.city && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--muted)' }}>
              <MapPin size={10} />{rumor.city}
            </span>
          )}
          <span style={{
            fontSize: 11, color: 'var(--muted)', fontWeight: 500,
            padding: '2px 8px', borderRadius: 100,
            background: 'var(--bg-elevated, rgba(255,255,255,0.03))',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
          }}>
            {rumor.anonymous_alias}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {formatRelativeTime(rumor.created_at)}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, marginBottom: 12, letterSpacing: '-0.01em' }}>
          {rumor.title}
        </h1>

        {/* Content */}
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
          {rumor.content}
        </p>

        {/* Tags */}
        {rumor.tags && rumor.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {rumor.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 11, color: 'var(--primary)', padding: '2px 8px',
                borderRadius: 100, background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Verdict badge */}
        {verdict && VerdictIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '14px 16px', borderRadius: 10,
              background: `${verdict.color}08`, border: `1px solid ${verdict.color}20`,
              marginBottom: 16,
            }}
          >
            <span style={{ color: verdict.color, marginTop: 1, flexShrink: 0, display: 'flex' }}>
              <VerdictIcon size={18} />
            </span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: verdict.color }}>
                Verdict: {verdict.label}
              </span>
              {rumor.verdict_reason && (
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                  {rumor.verdict_reason}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Stats row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, paddingTop: 14,
          borderTop: '1px solid var(--border)', flexWrap: 'wrap',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: heatColor, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            <Flame size={13} />{Math.floor(rumor.heat_score)} heat
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
            <Eye size={13} />{rumor.view_count || 0} views
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
            <Zap size={13} />{votes.length} votes
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
            <MessageCircle size={13} />{comments.length} comments
          </span>
        </div>
      </motion.div>

      {/* ── Voting Section ─────────────────────────────────────────────── */}
      <motion.div
        className="feed-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.05 }}
        style={{ padding: '20px 24px', marginBottom: 16 }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
          What do you think?
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(Object.entries(VOTE_CONFIG) as [string, typeof VOTE_CONFIG.believe][]).map(([type, config]) => {
            const isActive = currentVote === type
            const count = voteCounts[type as keyof typeof voteCounts]
            return (
              <motion.button
                key={type}
                onClick={() => handleVote(type)}
                disabled={votingInProgress}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: votingInProgress ? 'not-allowed' : 'pointer',
                  border: `1.5px solid ${isActive ? config.border : 'var(--border)'}`,
                  background: isActive ? config.bg : 'transparent',
                  color: isActive ? config.color : 'var(--muted)',
                  transition: 'all 0.2s ease',
                  opacity: votingInProgress ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: 16 }}>{config.icon}</span>
                {config.label}
                <span style={{
                  fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  padding: '1px 6px', borderRadius: 100,
                  background: isActive ? `${config.color}15` : 'var(--bg-elevated, rgba(255,255,255,0.03))',
                  color: isActive ? config.color : 'var(--muted)',
                }}>
                  {count}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Comments Section ───────────────────────────────────────────── */}
      <motion.div
        className="feed-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
        style={{ padding: '20px 24px' }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
          <MessageCircle size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
          Comments ({comments.length})
        </h3>

        {/* New comment input */}
        <div style={{ marginBottom: 24 }}>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Share your take..."
            rows={3}
            className="input"
            style={{
              width: '100%', resize: 'vertical', fontSize: 13,
              lineHeight: 1.6, marginBottom: 8, minHeight: 70,
              background: 'var(--bg, #0F172A)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 14px',
              color: 'var(--text)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 500, padding: '6px 12px',
                borderRadius: 8, border: `1px solid ${isAnonymous ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                background: isAnonymous ? 'rgba(99,102,241,0.08)' : 'transparent',
                color: isAnonymous ? 'var(--primary)' : 'var(--muted)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <Shield size={12} />
              {isAnonymous ? 'Anonymous' : 'Public'}
            </button>
            <motion.button
              onClick={() => submitComment(null, commentText, isAnonymous)}
              disabled={!commentText.trim() || submittingComment}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: commentText.trim() ? 'var(--primary)' : 'var(--border)',
                color: commentText.trim() ? '#fff' : 'var(--muted)',
                border: 'none', cursor: commentText.trim() && !submittingComment ? 'pointer' : 'not-allowed',
                opacity: submittingComment ? 0.6 : 1,
                transition: 'all 0.15s',
              }}
            >
              <Send size={12} />
              {submittingComment ? 'Posting...' : 'Post'}
            </motion.button>
          </div>
        </div>

        {/* Comments list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {topLevel.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '24px 0' }}>
              No comments yet. Be the first to share your take.
            </p>
          )}
          {topLevel.map(comment => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={repliesMap[comment.id] || []}
              allReplies={repliesMap}
              depth={0}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              replyAnonymous={replyAnonymous}
              setReplyAnonymous={setReplyAnonymous}
              submitComment={submitComment}
              submittingComment={submittingComment}
              expandedReplies={expandedReplies}
              toggleReplies={toggleReplies}
              rumorId={rumor.id}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ── Comment Thread Component ───────────────────────────────────────────────

interface CommentThreadProps {
  comment: Comment
  replies: Comment[]
  allReplies: Record<string, Comment[]>
  depth: number
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  replyText: string
  setReplyText: (text: string) => void
  replyAnonymous: boolean
  setReplyAnonymous: (v: boolean) => void
  submitComment: (parentId: string | null, content: string, anonymous: boolean) => Promise<void>
  submittingComment: boolean
  expandedReplies: Set<string>
  toggleReplies: (id: string) => void
  rumorId: string
}

function CommentThread({
  comment, replies, allReplies, depth,
  replyingTo, setReplyingTo, replyText, setReplyText,
  replyAnonymous, setReplyAnonymous, submitComment, submittingComment,
  expandedReplies, toggleReplies, rumorId,
}: CommentThreadProps) {
  const displayName = comment.is_anonymous
    ? (comment.anonymous_alias || 'Anonymous')
    : (comment.users?.display_name || comment.users?.username || 'User')
  const rank = !comment.is_anonymous ? comment.users?.rank : null
  const isExpanded = expandedReplies.has(comment.id)
  const hasReplies = replies.length > 0
  const maxNestingDepth = 2

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        paddingLeft: depth > 0 ? 20 : 0,
        borderLeft: depth > 0 ? '2px solid var(--border)' : 'none',
        marginLeft: depth > 0 ? 12 : 0,
      }}
    >
      <div style={{ padding: '14px 0', borderBottom: depth === 0 ? '1px solid var(--border)' : 'none' }}>
        {/* Comment header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: comment.is_anonymous ? 'var(--muted)' : 'var(--text)',
            fontFamily: comment.is_anonymous ? 'var(--font-mono)' : 'inherit',
          }}>
            {comment.is_anonymous && <Shield size={10} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />}
            {displayName}
          </span>
          {rank && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 6px',
              borderRadius: 100, background: 'rgba(99,102,241,0.1)',
              color: 'var(--primary)', textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {rank}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>

        {/* Comment body */}
        <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 8, whiteSpace: 'pre-wrap' }}>
          {comment.content}
        </p>

        {/* Comment actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
            <ThumbsUp size={11} />{comment.upvotes || 0}
          </span>
          {depth < maxNestingDepth && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: replyingTo === comment.id ? 'var(--primary)' : 'var(--muted)',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, fontWeight: 500,
              }}
            >
              <Reply size={11} />Reply
            </button>
          )}
          {hasReplies && (
            <button
              onClick={() => toggleReplies(comment.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: 'var(--primary)', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Inline reply form */}
        <AnimatePresence>
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: 10 }}
            >
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to ${displayName}...`}
                rows={2}
                className="input"
                style={{
                  width: '100%', resize: 'vertical', fontSize: 12,
                  lineHeight: 1.5, marginBottom: 6, minHeight: 50,
                  background: 'var(--bg, #0F172A)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 12px',
                  color: 'var(--text)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setReplyAnonymous(!replyAnonymous)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, padding: '4px 10px', borderRadius: 6,
                    border: `1px solid ${replyAnonymous ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                    background: replyAnonymous ? 'rgba(99,102,241,0.08)' : 'transparent',
                    color: replyAnonymous ? 'var(--primary)' : 'var(--muted)',
                    cursor: 'pointer',
                  }}
                >
                  <Shield size={10} />{replyAnonymous ? 'Anon' : 'Public'}
                </button>
                <motion.button
                  onClick={() => submitComment(comment.id, replyText, replyAnonymous)}
                  disabled={!replyText.trim() || submittingComment}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: replyText.trim() ? 'var(--primary)' : 'var(--border)',
                    color: replyText.trim() ? '#fff' : 'var(--muted)',
                    border: 'none',
                    cursor: replyText.trim() && !submittingComment ? 'pointer' : 'not-allowed',
                    opacity: submittingComment ? 0.6 : 1,
                  }}
                >
                  <Send size={10} />Reply
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested replies */}
      <AnimatePresence>
        {isExpanded && replies.map(reply => (
          <CommentThread
            key={reply.id}
            comment={reply}
            replies={depth + 1 < 2 ? (allReplies[reply.id] || []) : []}
            allReplies={allReplies}
            depth={depth + 1}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
            replyAnonymous={replyAnonymous}
            setReplyAnonymous={setReplyAnonymous}
            submitComment={submitComment}
            submittingComment={submittingComment}
            expandedReplies={expandedReplies}
            toggleReplies={toggleReplies}
            rumorId={rumorId}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
