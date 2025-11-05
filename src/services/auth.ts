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


