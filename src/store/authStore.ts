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
import { strapiLogout, strapiRegister, strapiLogin, isStrapiEnabled } from '../services/strapi'
import { generateId } from '../services/storage'
import { authClient } from '../auth'
import { dispatchMcKenzieRegistrationEmails, resendMcKenzieRegistrationEmails } from '../services/emailService'
import { toast } from './toastStore'

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
  verifyUser: (token: string) => { success: boolean; user?: User; error?: string }
  verifyUserById: (userId: string) => void
  verifyAllProfessionals: () => void
  refreshUsers: () => void
  resendRegistrationEmails: (email: string) => Promise<{ success: boolean; error?: string }>
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

      // Synchronize session token with Strapi if available
      if (isStrapiEnabled()) {
        try {
          const strapiAuth = await strapiLogin(email.trim(), password)
          if (strapiAuth?.user?.role) {
            matched = {
              ...matched,
              role: strapiAuth.user.role,
              isVerified: strapiAuth.user.isVerified ?? matched.isVerified,
            }
            const currentUsers = get().users
            const updatedUsers = currentUsers.map((u) =>
              u.id === matched!.id || u.email.toLowerCase() === matched!.email.toLowerCase() ? matched! : u
            )
            saveUsers(updatedUsers)
            setCurrentUser(matched)
            set({ user: matched, users: updatedUsers })
          }
        } catch {
          // If login fails (user registered in Neon Auth but missing in Strapi), auto-register into Strapi
          try {
            const sanitizedUsername = (matched.name || email.split('@')[0]).trim().replace(/\s+/g, '_').toLowerCase() + '_' + Math.random().toString(36).substring(2, 6)
            await strapiRegister({
              username: sanitizedUsername,
              email: email.trim(),
              password,
              userRole: matched.role || 'LIP',
              firm: matched.firm,
              registrationNumber: matched.registrationNumber,
            })
          } catch {
            // Continue gracefully with active Neon session
          }
        }
      }

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

      const verificationToken = generateId('verify')
      const isVerified = false

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
        verificationToken,
        verificationSentAt: new Date().toISOString(),
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

      // Synchronize newly registered account into Strapi API so it appears in live directory
      if (isStrapiEnabled()) {
        try {
          const sanitizedUsername = name.trim().replace(/\s+/g, '_').toLowerCase() + '_' + Math.random().toString(36).substring(2, 6)
          await strapiRegister({
            username: sanitizedUsername,
            email: email.trim(),
            password,
            userRole: role,
            firm: firm?.trim(),
            registrationNumber: registrationNumber?.trim(),
          })
        } catch (strapiErr) {
          console.warn('[authStore] Strapi registration sync note:', strapiErr)
        }
      }

      // Dispatch Registration Confirmation and Verification Emails for all roles
      try {
        await dispatchMcKenzieRegistrationEmails({
          name: appUser.name,
          email: appUser.email,
          role: appUser.role,
          token: verificationToken,
        })
      } catch (emailErr) {
        console.warn('[authStore] Error dispatching registration emails:', emailErr)
      }

      return { success: true, user: appUser }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  },

  resendRegistrationEmails: async (email: string) => {
    try {
      const allUsers = get().users
      let user = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (!user) {
        const current = get().user
        if (current && current.email.toLowerCase() === email.toLowerCase()) {
          user = current
        } else {
          user = {
            id: generateId('user'),
            name: email.split('@')[0],
            email,
            role: 'LIP',
            isVerified: false,
          }
        }
      }

      const token = user.verificationToken || generateId('verify')
      const updatedUser: User = {
        ...user,
        verificationToken: token,
        verificationSentAt: new Date().toISOString(),
      }

      const existingIdx = allUsers.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
      const updatedUsers = existingIdx >= 0
        ? allUsers.map((u, i) => (i === existingIdx ? updatedUser : u))
        : [...allUsers, updatedUser]

      saveUsers(updatedUsers)
      set({
        users: updatedUsers,
        ...(get().user?.email.toLowerCase() === email.toLowerCase() ? { user: updatedUser } : {}),
      })

      await resendMcKenzieRegistrationEmails({
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token,
      })
      return { success: true }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
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
    toast.info('You have been signed out securely.', 'Signed Out')
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
}))
