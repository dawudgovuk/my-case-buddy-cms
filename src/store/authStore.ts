import { create } from 'zustand'
import type { User } from '../types/domain'
import { getCurrentUser, setCurrentUser, listUsers, saveUsers, verifyUserToken } from '../services/auth'

interface AuthState {
  user: User | null
  users: User[]
  login: (userId: string) => void
  logout: () => void
  ensureDemoUsers: () => void
  verifyUser: (token: string) => { success: boolean; user?: User; error?: string }
  refreshUsers: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getCurrentUser(),
  users: listUsers(),
  login: (userId: string) => {
    const u = get().users.find((u) => u.id === userId) || null
    setCurrentUser(u)
    set({ user: u })
  },
  logout: () => {
    setCurrentUser(null)
    set({ user: null })
  },
  refreshUsers: () => {
    const users = listUsers()
    const current = getCurrentUser()
    set({ users, user: current })
  },
  verifyUser: (token: string) => {
    const result = verifyUserToken(token)
    if (result.success && result.user) {
      const allUsers = listUsers()
      set({ users: allUsers, user: result.user })
    }
    return result
  },
  ensureDemoUsers: () => {
    let users = listUsers()
    if (users.length === 0) {
      users = [
        { id: 'u_lip_alice', name: 'Alice Brown', email: 'alice@example.com', role: 'LIP', isVerified: true },
        { id: 'u_lip_bob', name: 'Bob Green', email: 'bob@example.com', role: 'LIP', isVerified: true },
        {
          id: 'u_mf_jordan',
          name: 'Jordan Clerk',
          email: 'jordan@example.com',
          role: 'McKenzieFriend',
          isVerified: true,
          bio: 'Experienced McKenzie Friend with 8+ years supporting family court litigants in private child disputes.',
          yearsExperience: 8,
        },
        {
          id: 'u_sol_sarah',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@law.co.uk',
          role: 'Solicitor',
          firm: 'Jenkins & Co Solicitors',
          registrationNumber: 'SRA-481902',
          isVerified: true,
          bio: 'Specialist children and domestic abuse solicitor offering peer mentoring and review.',
          yearsExperience: 12,
        },
        {
          id: 'u_bar_david',
          name: 'David Vance',
          email: 'david.vance@chambers.org',
          role: 'Barrister',
          firm: 'Doughty Street Chambers',
          registrationNumber: 'BSB-98314',
          isVerified: true,
          bio: 'Family Law Barrister passionate about access to justice and peer support in complex proceedings.',
          yearsExperience: 10,
        },
        {
          id: 'u_sol_unverified',
          name: 'Marcus Bell (Unverified)',
          email: 'marcus.bell@unverified.co.uk',
          role: 'Solicitor',
          firm: 'Bell Legal',
          registrationNumber: 'SRA-999111',
          isVerified: false,
          verificationToken: 'verify_demo_token_marcus',
          bio: 'Newly registered solicitor awaiting email verification.',
        },
      ]
      saveUsers(users)
    }
    set({ users })
  },
}))


