'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import {
  User, Lock, Bell, Shield, LogOut, Save, Loader,
  Eye, EyeOff, CheckCircle, XCircle, Camera, Trash2, AlertTriangle
} from 'lucide-react'
import { AvatarSVG } from '@/components/AvatarSVG'
import { PFP_STYLES, type PfpStyle } from '@/lib/ranks'
import toast from 'react-hot-toast'

const PFP_STYLE_KEYS = Object.keys(PFP_STYLES) as PfpStyle[]

type SettingsTab = 'profile' | 'account' | 'notifications' | 'danger'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, profile, loading: authLoading } = useSupabase()

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [saving, setSaving] = useState(false)

  // Profile fields
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [city, setCity] = useState(profile?.city || '')
  const [selectedPfp, setSelectedPfp] = useState<PfpStyle>((profile?.pfp_style as PfpStyle) || 'neon_orb')

  // Username availability
  const [newUsername, setNewUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [usernameTimer, setUsernameTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  const checkUsername = useCallback(async (val: string) => {
    if (!val || val.length < 3) { setUsernameStatus('idle'); return }
    setUsernameStatus('checking')
    const { data } = await supabase.from('users').select('id').eq('username', val).single()
    setUsernameStatus(data && data.id !== user?.id ? 'taken' : 'available')
  }, [supabase, user?.id])

  const handleUsernameChange = (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setNewUsername(cleaned)
    if (usernameTimer) clearTimeout(usernameTimer)
    setUsernameTimer(setTimeout(() => checkUsername(cleaned), 500))
  }

  const saveProfile = async () => {
    if (!user || !profile) return
    setSaving(true)
    try {
      const updates: Record<string, string> = {}
      if (displayName !== profile.display_name) updates.display_name = displayName
      if (bio !== profile.bio) updates.bio = bio
      if (city !== profile.city) updates.city = city
      if (selectedPfp !== profile.pfp_style) updates.pfp_style = selectedPfp

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('users').update(updates).eq('id', user.id)
        if (error) throw error
      }

      if (newUsername && usernameStatus === 'available') {
        const { error } = await supabase.from('users').update({ username: newUsername }).eq('id', user.id)
        if (error) throw error
      }

      toast.success('Profile updated!')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.')
    if (!confirmed) return
    toast.error('Please contact sandncolol@gmail.com to delete your account.')
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  if (!user || !profile) {
    router.push('/login?next=/settings')
    return null
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Danger Zone', icon: Shield },
  ]

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Sidebar nav */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 'var(--r-md)',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 13, fontWeight: 500,
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    color: isActive ? 'var(--text)' : 'var(--muted)',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={15} style={{ color: isActive ? 'var(--primary)' : 'var(--subtle)', flexShrink: 0 }} />
                  {tab.label}
                </button>
              )
            })}

            <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 'var(--r-md)',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontSize: 13, fontWeight: 500, width: '100%',
                  background: 'transparent', color: '#EF4444', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={15} style={{ color: '#EF4444', flexShrink: 0 }} />
                Sign out
              </button>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                <div className="card" style={{ padding: 22 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Profile Information</h2>

                  {/* Avatar picker */}
                  <div style={{ marginBottom: 22 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Avatar Style
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {PFP_STYLE_KEYS.map(style => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setSelectedPfp(style)}
                          style={{
                            padding: 4, borderRadius: 12,
                            border: `2px solid ${selectedPfp === style ? 'var(--primary)' : 'var(--border)'}`,
                            background: selectedPfp === style ? 'var(--primary-dim)' : 'transparent',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          <AvatarSVG style={style} size={48} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Display name */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      maxLength={50}
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Username change */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Username <span style={{ fontWeight: 400 }}>(current: @{profile.username})</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={e => handleUsernameChange(e.target.value)}
                        placeholder="New username (leave blank to keep current)"
                        maxLength={30}
                        className="input"
                        style={{ width: '100%', paddingRight: 40 }}
                      />
                      {usernameStatus === 'checking' && (
                        <Loader size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} className="animate-spin" />
                      )}
                      {usernameStatus === 'available' && (
                        <CheckCircle size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }} />
                      )}
                      {usernameStatus === 'taken' && (
                        <XCircle size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#EF4444' }} />
                      )}
                    </div>
                    {usernameStatus === 'taken' && (
                      <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>Username is already taken</p>
                    )}
                    {usernameStatus === 'available' && (
                      <p style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>Username is available!</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Tell the city about yourself..."
                      maxLength={200}
                      rows={3}
                      className="input"
                      style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 4, textAlign: 'right' }}>{bio.length}/200</p>
                  </div>

                  {/* City */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Your city"
                      className="input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <motion.button
                    onClick={saveProfile}
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save changes'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                <div className="card" style={{ padding: 22 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Change Password</h2>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
                    Email: <strong style={{ color: 'var(--text)' }}>{user.email}</strong>
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Minimum 8 characters"
                          className="input"
                          style={{ width: '100%', paddingRight: 40 }}
                        />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{
                          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--subtle)',
                        }}>
                          {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="input"
                        style={{ width: '100%' }}
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <motion.button
                    onClick={savePassword}
                    disabled={saving || !newPassword || !confirmPassword}
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, opacity: (!newPassword || !confirmPassword) ? 0.6 : 1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {saving ? <Loader size={14} className="animate-spin" /> : <Lock size={14} />}
                    {saving ? 'Updating...' : 'Update password'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                <div className="card" style={{ padding: 22 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Notifications</h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                    Notification preferences are coming soon. We'll let you know when they're available.
                  </p>
                  <div style={{
                    padding: '14px 16px', borderRadius: 'var(--r-md)',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <Bell size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    Notification settings coming soon
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'danger' && (
              <motion.div key="danger" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                <div className="card" style={{ padding: 22, border: '1px solid rgba(239,68,68,0.2)' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: '#EF4444', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={16} />
                    Danger Zone
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                    These actions are permanent and cannot be undone.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{
                      padding: '16px', borderRadius: 'var(--r-md)',
                      border: '1px solid rgba(239,68,68,0.15)',
                      background: 'rgba(239,68,68,0.04)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Delete account</p>
                          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px', borderRadius: 'var(--r-md)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                            cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            transition: 'all 0.15s', flexShrink: 0,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                        >
                          <Trash2 size={13} />
                          Delete account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
