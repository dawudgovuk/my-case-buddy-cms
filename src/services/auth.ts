import type { User, FamilyCase } from '../types/domain'
import { isVerifiedLegalProfessional } from '../utils/directoryUtils'
import { SNAPSHOT_STORAGE_KEY } from './storageKeys'

const AUTH_KEY = 'mycasebuddy:auth:v1'
const USERS_KEY = 'mycasebuddy:users:v1'

export function isDemoUser(u: { id?: string; email?: string } | null | undefined): boolean {
  if (!u) return false
  const id = u.id || ''
  const email = (u.email || '').toLowerCase()
  return (
    id.startsWith('u_lip_') ||
    id.startsWith('u_mf_') ||
    id.startsWith('u_sol_') ||
    id.startsWith('u_bar_') ||
    email.includes('unverified.co.uk') ||
    email.includes('unverified.chambers.org')
  )
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    const user = JSON.parse(raw) as User
    if (isDemoUser(user)) {
      localStorage.removeItem(AUTH_KEY)
      return null
    }
    return user
  } catch {
    return null
  }
}

export function setCurrentUser(user: User | null) {
  if (!user || isDemoUser(user)) {
    localStorage.removeItem(AUTH_KEY)
    return
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
}

export function listUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  try {
    const users = JSON.parse(raw) as User[]
    if (!Array.isArray(users)) return []

    // Filter out any hardcoded legacy demo personas
    const cleanUsers = users.filter((u) => !isDemoUser(u))
    if (cleanUsers.length !== users.length) {
      saveUsers(cleanUsers)
    }
    return cleanUsers
  } catch {
    return []
  }
}

export function saveUsers(users: User[]) {
  const cleanUsers = users.filter((u) => !isDemoUser(u))
  localStorage.setItem(USERS_KEY, JSON.stringify(cleanUsers))
}

/**
 * Purges all hardcoded demo personas, seeded demo cases, and demo tokens from browser local storage.
 */
export function purgeLegacyDemoData(): void {
  try {
    // 1. Current user session
    const rawAuth = localStorage.getItem(AUTH_KEY)
    if (rawAuth) {
      try {
        const u = JSON.parse(rawAuth)
        if (isDemoUser(u)) {
          localStorage.removeItem(AUTH_KEY)
        }
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }

    // 2. Users list
    const rawUsers = localStorage.getItem(USERS_KEY)
    if (rawUsers) {
      const users = JSON.parse(rawUsers)
      if (Array.isArray(users)) {
        const cleanUsers = (users as User[]).filter((u) => !isDemoUser(u))
        localStorage.setItem(USERS_KEY, JSON.stringify(cleanUsers))
      }
    }

    // 3. Local cases snapshot
    const rawSnapshot = localStorage.getItem(SNAPSHOT_STORAGE_KEY)
    if (rawSnapshot) {
      const snap = JSON.parse(rawSnapshot)
      if (Array.isArray(snap.cases)) {
        snap.cases = (snap.cases as FamilyCase[]).filter((c) => {
          const hasDemoMember = Boolean(c.members?.some((m) => isDemoUser({ id: m.userId, email: m.email })))
          const isDemoSeeded = typeof c.caseNumber === 'string' && c.caseNumber.startsWith('FC-') && c.id.startsWith('case_')
          return !hasDemoMember && !isDemoSeeded
        })
        localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snap))
      }
    }
  } catch (err) {
    console.warn('Error purging legacy demo data:', err)
  }
}

export function findUserById(userId: string): User | undefined {
  return listUsers().find((u) => u.id === userId)
}

export function findUserByToken(token: string): User | undefined {
  if (!token) return undefined
  return listUsers().find((u) => u.verificationToken === token)
}

/** Saves `updated` at `index` and refreshes the session when it is the signed-in user. */
function replaceStoredUser(users: User[], index: number, updated: User): void {
  users[index] = updated
  saveUsers(users)
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === updated.id) {
    setCurrentUser(updated)
  }
}

export function verifyUserToken(token: string): { success: boolean; user?: User; error?: string } {
  if (!token) {
    return { success: false, error: 'Invalid or expired verification token' }
  }

  const users = listUsers()
  const currentUser = getCurrentUser()

  // 1. Direct match on active verificationToken in users array
  const index = users.findIndex((u) => u.verificationToken === token)
  if (index !== -1) {
    const existingUser = users[index]
    const updatedUser: User = {
      ...existingUser,
      isVerified: true,
      verificationToken: undefined,
      lastVerifiedToken: token,
    }

    replaceStoredUser(users, index, updatedUser)
    return { success: true, user: updatedUser }
  }

  // 2. Direct match on current logged-in session user's active verificationToken
  if (currentUser && currentUser.verificationToken === token) {
    const updatedUser: User = {
      ...currentUser,
      isVerified: true,
      verificationToken: undefined,
      lastVerifiedToken: token,
    }
    setCurrentUser(updatedUser)
    const existingIdx = users.findIndex((u) => u.id === currentUser.id || (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()))
    if (existingIdx !== -1) {
      users[existingIdx] = updatedUser
    } else {
      users.push(updatedUser)
    }
    saveUsers(users)
    return { success: true, user: updatedUser }
  }

  // 3. Check if user was already verified with this exact token (idempotent reload/Strict-Mode)
  const alreadyVerifiedUser = users.find((u) => u.lastVerifiedToken === token) ||
    (currentUser?.lastVerifiedToken === token ? currentUser : undefined)
  if (alreadyVerifiedUser) {
    return { success: true, user: alreadyVerifiedUser }
  }

  // 4. Current signed-in user clicking their dispatched verification link
  if (currentUser && !currentUser.isVerified && token.startsWith('verify_')) {
    const updatedUser: User = {
      ...currentUser,
      isVerified: true,
      verificationToken: undefined,
      lastVerifiedToken: token,
    }
    setCurrentUser(updatedUser)
    const existingIdx = users.findIndex((u) => u.id === currentUser.id || (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()))
    if (existingIdx !== -1) {
      users[existingIdx] = updatedUser
    } else {
      users.push(updatedUser)
    }
    saveUsers(users)
    return { success: true, user: updatedUser }
  }

  // 5. Fallback: if currently logged-in user is already verified
  if (currentUser?.isVerified) {
    return { success: true, user: currentUser }
  }

  return { success: false, error: 'Invalid or expired verification token' }
}

export function verifyUserById(userId: string): User | undefined {
  const users = listUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return undefined

  const existingUser = users[index]
  const updatedUser: User = {
    ...existingUser,
    isVerified: true,
    verificationToken: undefined,
  }

  replaceStoredUser(users, index, updatedUser)
  return updatedUser
}

export function verifyAllProfessionals(): User[] {
  const users = listUsers()
  const updated = users.map((u) => {
    if (u.role !== 'LIP') {
      return { ...u, isVerified: true, verificationToken: undefined }
    }
    return u
  })

  saveUsers(updated)

  const currentUser = getCurrentUser()
  if (currentUser && currentUser.role !== 'LIP') {
    setCurrentUser({ ...currentUser, isVerified: true, verificationToken: undefined })
  }

  return updated
}

export function getVerifiedProfessionals(): User[] {
  return listUsers().filter(isVerifiedLegalProfessional)
}

export function updateUserProfile(userId: string, updates: Partial<User>): User | undefined {
  const users = listUsers()
  const index = users.findIndex(
    (u) => u.id === userId || (updates.email && u.email.toLowerCase() === updates.email.toLowerCase())
  )
  if (index === -1) {
    const current = getCurrentUser()
    if (
      current &&
      (current.id === userId || (updates.email && current.email.toLowerCase() === updates.email.toLowerCase()))
    ) {
      const updated: User = { ...current, ...updates }
      setCurrentUser(updated)
      saveUsers([...users, updated])
      return updated
    }
    return undefined
  }

  const existing = users[index]
  const updated: User = { ...existing, ...updates }
  replaceStoredUser(users, index, updated)
  return updated
}



