import type { User } from '../types/domain'

const AUTH_KEY = 'mycasebuddy:auth:v1'
const USERS_KEY = 'mycasebuddy:users:v1'

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setCurrentUser(user: User | null) {
  if (!user) {
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
    if (!Array.isArray(users) || users.length === 0) return []

    // Check if migration is needed (missing isVerified or imbalanced zero-verified/zero-unverified)
    const pros = users.filter(
      (u) => u.role === 'Solicitor' || u.role === 'Barrister' || u.role === 'McKenzieFriend'
    )
    const verifiedPros = pros.filter((p) => p.isVerified === true)
    const unverifiedPros = pros.filter((p) => p.isVerified === false)
    const hasMissingField = users.some((u) => typeof u.isVerified !== 'boolean')

    if (hasMissingField || (pros.length > 0 && (verifiedPros.length === 0 || unverifiedPros.length === 0))) {
      const roleCounts: Record<string, number> = {}

      const migrated: User[] = users.map((u) => {
        if (u.role === 'LIP') {
          return { ...u, isVerified: true }
        }

        roleCounts[u.role] = (roleCounts[u.role] || 0) + 1
        const indexInRole = roleCounts[u.role]

        // First 8 in each professional role are verified; remaining are unverified
        const isVerified = indexInRole <= 8
        return {
          ...u,
          isVerified,
          ...(!isVerified && !u.verificationToken
            ? { verificationToken: `demo_token_${u.id}` }
            : {}),
          ...(isVerified && u.verificationToken ? { verificationToken: undefined } : {}),
        }
      })

      saveUsers(migrated)
      const current = getCurrentUser()
      if (current) {
        const matching = migrated.find((m) => m.id === current.id)
        if (matching) setCurrentUser(matching)
      }
      return migrated
    }

    return users
  } catch {
    return []
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserById(userId: string): User | undefined {
  return listUsers().find((u) => u.id === userId)
}

export function findUserByToken(token: string): User | undefined {
  if (!token) return undefined
  return listUsers().find((u) => u.verificationToken === token)
}

export function verifyUserToken(token: string): { success: boolean; user?: User; error?: string } {
  const users = listUsers()
  const index = users.findIndex((u) => u.verificationToken === token)
  if (index === -1) {
    return { success: false, error: 'Invalid or expired verification token' }
  }

  const existingUser = users[index]
  const updatedUser: User = {
    ...existingUser,
    isVerified: true,
    verificationToken: undefined,
  }

  users[index] = updatedUser
  saveUsers(users)

  // Update current session if the verified user is currently logged in
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === updatedUser.id) {
    setCurrentUser(updatedUser)
  }

  return { success: true, user: updatedUser }
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

  users[index] = updatedUser
  saveUsers(users)

  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === updatedUser.id) {
    setCurrentUser(updatedUser)
  }

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
  return listUsers().filter(
    (u) =>
      (u.role === 'Solicitor' || u.role === 'Barrister' || u.role === 'McKenzieFriend') &&
      Boolean(u.isVerified)
  )
}



