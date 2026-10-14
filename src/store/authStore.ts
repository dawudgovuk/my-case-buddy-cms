import { create } from 'zustand'
import type { User, UserRole } from '../types/domain'
import {
  getCurrentUser,
  setCurrentUser,
  listUsers,
  saveUsers,
  verifyUserToken,
  verifyUserById as verifyUserByIdService,
  verifyAllProfessionals as verifyAllProfessionalsService,
} from '../services/auth'
import { strapiLogout } from '../services/strapi'
import { generateId } from '../services/storage'
import { authClient } from '../auth'

export interface NeonSessionData {
  id: string
  userId: string
  token: string
  expiresAt: string | Date
}

export interface NeonUserData {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  role?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface AuthState {
  user: User | null
  users: User[]
  neonUser: NeonUserData | null
  neonSession: NeonSessionData | null
  isLoadingSession: boolean
  login: (userId: string) => void
  loginWithUser: (user: User) => void
  loginWithNeon: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  registerWithNeon: (params: {
    name: string
    email: string
    password: string
    role?: UserRole
    firm?: string
    registrationNumber?: string
  }) => Promise<{ success: boolean; error?: string; user?: User }>
  initNeonAuth: () => Promise<void>
  logout: () => Promise<void> | void
  ensureDemoUsers: () => void
  verifyUser: (token: string) => { success: boolean; user?: User; error?: string }
  verifyUserById: (userId: string) => void
  verifyAllProfessionals: () => void
  refreshUsers: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getCurrentUser(),
  users: listUsers(),
  neonUser: null,
  neonSession: null,
  isLoadingSession: true,

  initNeonAuth: async () => {
    try {
      const res = await authClient.getSession()
      if (res.data?.session && res.data?.user) {
        const nUser = res.data.user as NeonUserData
        const nSession = res.data.session as NeonSessionData
        const users = get().users
        let matched = users.find((u) => u.email.toLowerCase() === nUser.email.toLowerCase())
        if (!matched) {
          matched = {
            id: nUser.id,
            name: nUser.name || nUser.email.split('@')[0],
            email: nUser.email,
            role: 'LIP',
            isVerified: Boolean(nUser.emailVerified),
          }
          const updatedUsers = [...users, matched]
          saveUsers(updatedUsers)
          set({ users: updatedUsers })
        }
        setCurrentUser(matched)
        set({
          user: matched,
          neonUser: nUser,
          neonSession: nSession,
          isLoadingSession: false,
        })
        return
      }
    } catch (err) {
      console.warn('Neon auth getSession check failed:', err)
    }
    set({ isLoadingSession: false })
  },

  loginWithNeon: async (email: string, password: string) => {
    try {
      const res = await authClient.signIn.email({ email: email.trim(), password })
      if (res.error) {
        return { success: false, error: res.error.message || 'Neon authentication failed' }
      }

      // Fetch or use session info
      const sessionRes = await authClient.getSession()
      const nUser = (sessionRes.data?.user || res.data?.user) as NeonUserData | undefined
      const nSession = (sessionRes.data?.session || null) as NeonSessionData | null

      if (!nUser) {
        return { success: false, error: 'Could not resolve authenticated user' }
      }

      // Sync into application user list
      const users = get().users
      let matched = users.find((u) => u.email.toLowerCase() === nUser.email.toLowerCase())
      if (!matched) {
        matched = {
          id: nUser.id,
          name: nUser.name || email.split('@')[0],
          email: nUser.email,
          role: 'LIP',
          isVerified: Boolean(nUser.emailVerified),
        }
        const updatedUsers = [...users, matched]
        saveUsers(updatedUsers)
        set({ users: updatedUsers })
      } else {
        // Keep verification state up to date with Neon
        if (nUser.emailVerified && !matched.isVerified) {
          matched = { ...matched, isVerified: true }
          const updatedUsers = users.map((u) => (u.id === matched!.id ? matched! : u))
          saveUsers(updatedUsers)
          set({ users: updatedUsers })
        }
      }

      setCurrentUser(matched)
      set({
        user: matched,
        neonUser: nUser,
        neonSession: nSession,
      })

      return { success: true, user: matched }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  },

  registerWithNeon: async ({ name, email, password, role = 'LIP', firm, registrationNumber }) => {
    try {
      const res = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      if (res.error) {
        return { success: false, error: res.error.message || 'Registration failed' }
      }

      const sessionRes = await authClient.getSession()
      const nUser = (sessionRes.data?.user || res.data?.user) as NeonUserData | undefined
      const nSession = (sessionRes.data?.session || null) as NeonSessionData | null

      const isProfessional = role !== 'LIP'
      const isVerified = !isProfessional
      const verificationToken = isProfessional ? generateId('verify') : undefined

      const users = get().users
      const existingIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())

      const appUser: User = {
        id: nUser?.id || generateId('user'),
        name: name.trim(),
        email: email.trim(),
        role,
        firm: firm?.trim(),
        registrationNumber: registrationNumber?.trim(),
        isVerified,
        ...(verificationToken && {
          verificationToken,
          verificationSentAt: new Date().toISOString(),
        }),
      }

      let updatedUsers: User[]
      if (existingIndex >= 0) {
        updatedUsers = [...users]
        updatedUsers[existingIndex] = { ...updatedUsers[existingIndex], ...appUser }
      } else {
        updatedUsers = [...users, appUser]
      }

      saveUsers(updatedUsers)
      setCurrentUser(appUser)
      set({
        users: updatedUsers,
        user: appUser,
        neonUser: nUser || null,
        neonSession: nSession,
      })

      return { success: true, user: appUser }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  },

  login: (userId: string) => {
    const u = get().users.find((u) => u.id === userId) || null
    setCurrentUser(u)
    set({ user: u })
  },

  loginWithUser: (user: User) => {
    const existing = get().users
    const isExisting = existing.some((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase())
    const updated = isExisting
      ? existing.map((u) => (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase() ? user : u))
      : [user, ...existing]
    saveUsers(updated)
    setCurrentUser(user)
    set({ user, users: updated })
  },

  logout: async () => {
    strapiLogout()
    try {
      await authClient.signOut()
    } catch (err) {
      console.warn('Neon signOut error:', err)
    }
    setCurrentUser(null)
    set({ user: null, neonUser: null, neonSession: null })
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

  verifyUserById: (userId: string) => {
    verifyUserByIdService(userId)
    const allUsers = listUsers()
    const current = getCurrentUser()
    set({ users: allUsers, user: current })
  },

  verifyAllProfessionals: () => {
    verifyAllProfessionalsService()
    const allUsers = listUsers()
    const current = getCurrentUser()
    set({ users: allUsers, user: current })
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
          id: 'u_mf_unverified',
          name: 'Arthur Pendelton (Unverified)',
          email: 'arthur.pendelton@unverified.co.uk',
          role: 'McKenzieFriend',
          isVerified: false,
          verificationToken: 'verify_demo_token_arthur',
          bio: 'Newly registered McKenzie Friend awaiting email verification.',
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
        {
          id: 'u_bar_unverified',
          name: 'Helena Vance (Unverified)',
          email: 'helena.vance@unverified.chambers.org',
          role: 'Barrister',
          firm: 'Matrix Chambers',
          registrationNumber: 'BSB-112233',
          isVerified: false,
          verificationToken: 'verify_demo_token_helena',
          bio: 'Pupil barrister awaiting email verification clearance.',
        },
      ]
      saveUsers(users)
    }
    set({ users })
  },
}))
