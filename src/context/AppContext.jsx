import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/*
 * AppContext — now backed by Supabase (auth + Postgres) instead of localStorage.
 * The public API (login, register, currentUser, users, createSwap, ...) is the
 * same as before, so the pages didn't need to change.
 *
 * Skills are stored denormalized on the `profiles` row (offer/want arrays +
 * level maps) so a profile maps cleanly to the shape the UI expects.
 */

const AppContext = createContext(null)

// ---- mappers: DB rows (snake_case) -> app shape (camelCase) ----
function mapProfile(row) {
  if (!row) return null
  return {
    id: row.id,
    name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    initials: row.initials || '',
    location: row.location || '',
    role: row.role || 'Member',
    bio: row.bio || '',
    color: row.avatar_color || '#298C6E',
    availability: row.availability || 'Available Now',
    level: row.level || 'Intermediate',
    swaps: row.swaps ?? 0,
    rating: row.rating ?? 0,
    offer: row.offer || [],
    want: row.want || [],
    offerLevels: row.offer_levels || {},
    wantLevels: row.want_levels || {},
    hoursPerWeek: row.hours_per_week ?? null,
    reviews: [],
    joined: row.created_at
      ? new Date(row.created_at).toLocaleString('en-US', { month: 'short', year: 'numeric' })
      : '',
  }
}

const mapSwap = (r) => ({
  id: r.id,
  requesterId: r.requester_id,
  recipientId: r.recipient_id,
  offerSkill: r.offer_skill,
  wantSkill: r.want_skill,
  status: r.status,
  createdAt: r.created_at,
})

const mapMessage = (r) => ({
  id: r.id,
  swapId: r.swap_id,
  senderId: r.sender_id,
  body: r.body,
  read: r.read,
  createdAt: r.created_at,
})

export function AppProvider({ children }) {
  const [session, setSession] = useState(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [swaps, setSwaps] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const userId = session?.user?.id || null

  // ---- loaders ----
  const loadProfile = useCallback(async (id) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    if (error) console.error('loadProfile', error)
    setCurrentUser(mapProfile(data))
  }, [])

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) console.error('loadUsers', error)
    setUsers((data || []).map(mapProfile))
  }, [])

  const loadSwapsAndMessages = useCallback(async (id) => {
    const { data: sw, error } = await supabase
      .from('swap_requests')
      .select('*')
      .or(`requester_id.eq.${id},recipient_id.eq.${id}`)
      .order('created_at', { ascending: false })
    if (error) console.error('loadSwaps', error)
    const swapList = (sw || []).map(mapSwap)
    setSwaps(swapList)

    const ids = swapList.map((s) => s.id)
    if (ids.length) {
      const { data: msg, error: mErr } = await supabase
        .from('messages').select('*').in('swap_id', ids)
        .order('created_at', { ascending: true })
      if (mErr) console.error('loadMessages', mErr)
      setMessages((msg || []).map(mapMessage))
    } else {
      setMessages([])
    }
  }, [])

  const refreshSwaps = useCallback(() => {
    if (userId) loadSwapsAndMessages(userId)
  }, [userId, loadSwapsAndMessages])

  // 1) Track the auth session. (No supabase calls inside the callback — that
  //    can deadlock; we react to session changes in the effect below.)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setSessionChecked(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 2) Whenever the logged-in user changes, load (or clear) their data.
  useEffect(() => {
    if (!sessionChecked) return
    let cancelled = false
    const run = async () => {
      if (userId) {
        setLoading(true)
        await loadProfile(userId)
        await Promise.all([loadUsers(), loadSwapsAndMessages(userId)])
        if (!cancelled) setLoading(false)
      } else {
        setCurrentUser(null); setUsers([]); setSwaps([]); setMessages([])
        setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [sessionChecked, userId, loadProfile, loadUsers, loadSwapsAndMessages])

  // 3) Realtime — keep data fresh without a manual refresh. When swaps,
  //    messages, or profiles change in the database, re-fetch the affected
  //    slice. Row-Level Security still applies, so we only receive changes
  //    we're allowed to see.
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('skillswap-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'swap_requests' },
        () => loadSwapsAndMessages(userId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' },
        () => loadSwapsAndMessages(userId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' },
        () => loadUsers())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, loadSwapsAndMessages, loadUsers])

  // ---- Auth ----
  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) return { error: error.message }
    return { ok: true }
  }, [])

  const register = useCallback(async (data) => {
    const { data: signUp, error } = await supabase.auth.signUp({
      email: data.email.trim(), password: data.password,
    })
    if (error) return { error: error.message }
    if (!signUp.user) return { error: 'Sign up failed. Please try again.' }

    const offering = data.offering || []
    const wanting = data.wanting || []
    const initials = `${data.firstName[0] || ''}${data.lastName[0] || ''}`.toUpperCase()

    const { data: inserted, error: insErr } = await supabase.from('profiles').insert({
      id: signUp.user.id,
      first_name: data.firstName,
      last_name: data.lastName,
      location: data.location || '',
      role: 'Member',
      bio: 'New to SkillSwap and excited to start swapping skills!',
      initials,
      avatar_color: '#298C6E',
      hours_per_week: data.hours || null,
      availability: data.availability || 'Available Now',
      level: 'Intermediate',
      offer: offering,
      want: wanting,
      offer_levels: Object.fromEntries(offering.map((s) => [s, 'Intermediate'])),
      want_levels: Object.fromEntries(wanting.map((s) => [s, 'Any level'])),
    }).select().single()

    if (insErr) return { error: insErr.message }
    setCurrentUser(mapProfile(inserted))
    return { ok: true }
  }, [])

  const logout = useCallback(async () => {
    // Clear local state right away so pages don't briefly see a stale
    // "logged in" state during the async sign-out (which caused logout to
    // bounce through /feed and land on /login).
    setSession(null)
    setCurrentUser(null)
    setUsers([])
    setSwaps([])
    setMessages([])
    await supabase.auth.signOut()
  }, [])

  const changePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: error.message }
    return { ok: true }
  }, [])

  // ---- Profile ----
  const updateProfile = useCallback(async (updates) => {
    if (!userId) return
    const row = {}
    if (updates.name !== undefined) {
      const parts = updates.name.trim().split(' ')
      row.first_name = parts[0] || ''
      row.last_name = parts.slice(1).join(' ')
    }
    if (updates.role !== undefined)        row.role = updates.role
    if (updates.location !== undefined)    row.location = updates.location
    if (updates.bio !== undefined)         row.bio = updates.bio
    if (updates.initials !== undefined)    row.initials = updates.initials
    if (updates.offer !== undefined)       row.offer = updates.offer
    if (updates.want !== undefined)        row.want = updates.want
    if (updates.offerLevels !== undefined) row.offer_levels = updates.offerLevels
    if (updates.wantLevels !== undefined)  row.want_levels = updates.wantLevels
    if (updates.availability !== undefined) row.availability = updates.availability
    if (updates.hoursPerWeek !== undefined) row.hours_per_week = updates.hoursPerWeek
    if (updates.avatarColor !== undefined)  row.avatar_color = updates.avatarColor

    const { data, error } = await supabase.from('profiles').update(row).eq('id', userId).select().single()
    if (error) { console.error('updateProfile', error); return }
    setCurrentUser(mapProfile(data))
    loadUsers()
  }, [userId, loadUsers])

  // ---- Swaps ----
  const createSwap = useCallback(async ({ recipientId, offerSkill, wantSkill, message }) => {
    if (!userId) return
    const { data: swap, error } = await supabase.from('swap_requests').insert({
      requester_id: userId, recipient_id: recipientId,
      offer_skill: offerSkill, want_skill: wantSkill, status: 'Pending',
    }).select().single()
    if (error) { console.error('createSwap', error); return }
    if (message?.trim() && swap) {
      await supabase.from('messages').insert({ swap_id: swap.id, sender_id: userId, body: message.trim() })
    }
    refreshSwaps()
  }, [userId, refreshSwaps])

  const updateSwapStatus = useCallback(async (swapId, status) => {
    const { error } = await supabase.from('swap_requests').update({ status }).eq('id', swapId)
    if (error) console.error('updateSwapStatus', error)
    refreshSwaps()
  }, [refreshSwaps])

  // ---- Messages ----
  const sendMessage = useCallback(async (swapId, body) => {
    if (!body.trim() || !userId) return
    const { error } = await supabase.from('messages').insert({ swap_id: swapId, sender_id: userId, body: body.trim() })
    if (error) console.error('sendMessage', error)
    refreshSwaps()
  }, [userId, refreshSwaps])

  const markSwapRead = useCallback(async (swapId) => {
    if (!userId) return
    const { error } = await supabase.from('messages').update({ read: true })
      .eq('swap_id', swapId).neq('sender_id', userId)
    if (error) console.error('markSwapRead', error)
    refreshSwaps()
  }, [userId, refreshSwaps])

  // ---- Derived ----
  const getUser = useCallback(
    (id) => users.find((u) => String(u.id) === String(id)) || null,
    [users]
  )
  const mySwaps = swaps
  const pendingIncoming = swaps.filter((s) => s.recipientId === userId && s.status === 'Pending').length
  const unreadCount = messages.filter((m) => m.senderId !== userId && !m.read).length

  const value = {
    currentUser, users, swaps, messages, mySwaps, pendingIncoming, unreadCount, loading,
    login, register, logout, updateProfile, changePassword,
    createSwap, updateSwapStatus, sendMessage, markSwapRead, getUser,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}