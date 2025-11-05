import { create } from 'zustand'
import type { User, UserRole } from '../types/domain'
import { getCurrentUser, setCurrentUser, listUsers, saveUsers } from '../services/auth'

interface AuthState {
  user: User | null
  users: User[]
  login: (userId: string) => void
  logout: () => void
  ensureDemoUsers: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getCurrentUser(),
  users: listUsers(),
  login: (userId: string) => {
    const u = get().users.find(u => u.id === userId) || null
    setCurrentUser(u)
    set({ user: u })
  },
  logout: () => {
    setCurrentUser(null)
    set({ user: null })
  },
  ensureDemoUsers: () => {
    let users = listUsers()
    if (users.length === 0) {
      users = [
        { id: 'u_lip_alice', name: 'Alice Brown', email: 'alice@example.com', role: 'LIP' },
        { id: 'u_lip_bob', name: 'Bob Green', email: 'bob@example.com', role: 'LIP' },
        { id: 'u_mf_jordan', name: 'Jordan Clerk', email: 'jordan@example.com', role: 'McKenzieFriend' },
      ]
      saveUsers(users)
    }
    set({ users })
  },
}))


