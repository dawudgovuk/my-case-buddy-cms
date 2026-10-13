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
    return JSON.parse(raw) as User[]
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

export function getVerifiedProfessionals(): User[] {
  return listUsers().filter(
    (u) =>
      (u.role === 'Solicitor' || u.role === 'Barrister' || u.role === 'McKenzieFriend') &&
      Boolean(u.isVerified)
  )
}



