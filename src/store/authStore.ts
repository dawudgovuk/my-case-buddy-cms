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
  updateUserProfile as updateUserProfileService,
} from '../services/auth'
import {
  strapiLogout,
  strapiRegister,
  strapiLogin,
  isStrapiEnabled,
  setStrapiToken,
  getStrapiToken,
  strapiGetMe,
  updateStrapiUserProfile,
} from '../services/strapi'
import { generateId } from '../services/storage'
import { authClient } from '../auth'
import { dispatchMcKenzieRegistrationEmails, resendMcKenzieRegistrationEmails } from '../services/emailService'
import { toast } from './toastStore'
import { getErrorMessage } from '../utils/errors'
import { appUserFromNeon, findUserByEmail, sameEmail, toStrapiUsername } from '../utils/userUtils'

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
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: listUsers(),
  neonUser: null,
  neonSession: null,
  isLoadingSession: true,

  initNeonAuth: async () => {
    try {
      // 1. Verify Neon Auth session
      let neonUser: NeonUserData | null = null
      let neonSession: NeonSessionData | null = null

      try {
        const res = await authClient.getSession()
        if (res.data?.session && res.data?.user) {
          neonUser = res.data.user as NeonUserData
          neonSession = res.data.session as NeonSessionData
        }
      } catch (err) {
        console.warn('Neon auth getSession check failed:', err)
      }

      // 2. Verify Strapi session if Strapi integration is enabled and token exists
      let strapiUser: User | null = null
      if (isStrapiEnabled() && getStrapiToken()) {
        try {
          strapiUser = await strapiGetMe()
          if (!strapiUser) {
            setStrapiToken(null)
          }
        } catch {
          setStrapiToken(null)
        }
      }

      // 3. Resolve verified session
      if (neonUser) {
        const users = get().users
        let matched = findUserByEmail(users, neonUser.email)
        if (!matched) {
          matched = appUserFromNeon(neonUser, neonUser.email.split('@')[0])
          const updatedUsers = [...users, matched]
          saveUsers(updatedUsers)
          set({ users: updatedUsers })
        }
        if (strapiUser && sameEmail(strapiUser.email, neonUser.email)) {
          matched = {
            ...matched,
            role: strapiUser.role || matched.role,
            isVerified: strapiUser.isVerified ?? matched.isVerified,
            firm: strapiUser.firm || matched.firm,
            registrationNumber: strapiUser.registrationNumber || matched.registrationNumber,
          }
        }
        setCurrentUser(matched)
        set({
          user: matched,
          neonUser,
          neonSession,
          isLoadingSession: false,
        })
        return
      }

      if (strapiUser) {
        const users = get().users
        let matched = findUserByEmail(users, strapiUser.email)
        if (!matched) {
          matched = strapiUser
          const updatedUsers = [...users, matched]
          saveUsers(updatedUsers)
          set({ users: updatedUsers })
        } else {
          matched = { ...matched, ...strapiUser }
        }
        setCurrentUser(matched)
        set({
          user: matched,
          neonUser: null,
          neonSession: null,
          isLoadingSession: false,
        })
        return
      }

      // 4. NEITHER backend has an active session.
      // Purge any residual localStorage session so nonexistent/deleted users cannot access protected routes.
      setCurrentUser(null)
      setStrapiToken(null)
      set({
        user: null,
        neonUser: null,
        neonSession: null,
        isLoadingSession: false,
      })
    } catch (err) {
      console.warn('Session initialization error:', err)
      setCurrentUser(null)
      setStrapiToken(null)
      set({
        user: null,
        neonUser: null,
        neonSession: null,
        isLoadingSession: false,
      })
    }
  },

  loginWithNeon: async (email: string, password: string) => {
    try {
      const res = await authClient.signIn.email({ email: email.trim(), password })
      if (res.error) {
        // Fallback: If Neon Auth fails, check if the account is directly in Strapi
        if (isStrapiEnabled()) {
          try {
            const strapiAuth = await strapiLogin(email.trim(), password)
            if (strapiAuth?.user) {
              const matched = strapiAuth.user
              setCurrentUser(matched)
              set({ user: matched, neonUser: null, neonSession: null })
              return { success: true, user: matched }
            }
          } catch {
            // Both providers rejected credentials
          }
        }
        return { success: false, error: res.error.message || 'Authentication failed' }
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
      let matched = findUserByEmail(users, nUser.email)
      if (!matched) {
        matched = appUserFromNeon(nUser, email.split('@')[0])
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
              u.id === matched!.id || sameEmail(u.email, matched!.email) ? matched! : u
            )
            saveUsers(updatedUsers)
            setCurrentUser(matched)
            set({ user: matched, users: updatedUsers })
          }
        } catch {
          // Clear any stale token from a previous user session
          setStrapiToken(null)
          // If login fails (user registered in Neon Auth but missing in Strapi), auto-register into Strapi
          try {
            await strapiRegister({
              username: toStrapiUsername(matched.name || email.split('@')[0]),
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
      return { success: false, error: getErrorMessage(err) }
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
      const existingIndex = users.findIndex((u) => sameEmail(u.email, email))

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
          await strapiRegister({
            username: toStrapiUsername(name),
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
      return { success: false, error: getErrorMessage(err) }
    }
  },

  resendRegistrationEmails: async (email: string) => {
    try {
      const allUsers = get().users
      let user = findUserByEmail(allUsers, email)
      if (!user) {
        const current = get().user
        if (current && sameEmail(current.email, email)) {
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

      const existingIdx = allUsers.findIndex((u) => sameEmail(u.email, email))
      const updatedUsers = existingIdx >= 0
        ? allUsers.map((u, i) => (i === existingIdx ? updatedUser : u))
        : [...allUsers, updatedUser]

      saveUsers(updatedUsers)
      const isSignedInUser = Boolean(get().user && sameEmail(get().user!.email, email))
      if (isSignedInUser) {
        // Persist the new token on the session so it survives a reload
        setCurrentUser(updatedUser)
      }
      set({ users: updatedUsers, ...(isSignedInUser ? { user: updatedUser } : {}) })

      await resendMcKenzieRegistrationEmails({
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token,
      })
      return { success: true }
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) }
    }
  },

  login: (userId: string) => {
    const u = get().users.find((u) => u.id === userId) || null
    setCurrentUser(u)
    set({ user: u })
  },

  loginWithUser: (user: User) => {
    const existing = get().users
    const isExisting = existing.some((u) => u.id === user.id || sameEmail(u.email, user.email))
    const updated = isExisting
      ? existing.map((u) => (u.id === user.id || sameEmail(u.email, user.email) ? user : u))
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
    // 1. Direct match on active user in memory
    const active = get().user
    if (active && (active.verificationToken === token || (!active.isVerified && token.startsWith('verify_')))) {
      const verifiedUser: User = {
        ...active,
        isVerified: true,
        verificationToken: undefined,
        lastVerifiedToken: token,
      }
      setCurrentUser(verifiedUser)
      const allUsers = get().users
      const idx = allUsers.findIndex((u) => u.id === active.id || sameEmail(u.email, active.email))
      const updatedUsers = idx >= 0
        ? allUsers.map((u, i) => (i === idx ? verifiedUser : u))
        : [...allUsers, verifiedUser]
      saveUsers(updatedUsers)
      set({ user: verifiedUser, users: updatedUsers })
      return { success: true, user: verifiedUser }
    }

    // 2. Delegate to verifyUserToken service
    const result = verifyUserToken(token)
    if (result.success) {
      if (result.user && active && (active.id === result.user.id || sameEmail(active.email, result.user.email))) {
        set({ user: result.user })
      }
      get().refreshUsers()
    }
    return result
  },

  verifyUserById: (userId: string) => {
    verifyUserByIdService(userId)
    get().refreshUsers()
  },

  verifyAllProfessionals: () => {
    verifyAllProfessionalsService()
    get().refreshUsers()
  },

  updateProfile: async (updates: Partial<User>) => {
    const current = get().user
    if (!current) {
      return { success: false, error: 'No user signed in' }
    }

    try {
      // 1. Update Strapi backend if Strapi is enabled
      let strapiUpdatedUser: User | undefined
      if (isStrapiEnabled()) {
        try {
          const res = await updateStrapiUserProfile(updates)
          if (res.success && res.user) {
            strapiUpdatedUser = res.user
          }
        } catch (strapiErr) {
          console.warn('[authStore] updateStrapiUserProfile error:', strapiErr)
        }
      }

      // 2. Merge updates
      const updatedUser: User = {
        ...current,
        ...(strapiUpdatedUser || {}),
        ...updates,
      }

      // 3. Update Better Auth / Neon Auth if name changed
      if (updates.name && updates.name !== current.name) {
        try {
          await authClient.updateUser({ name: updates.name })
        } catch {
          // Neon auth non-blocking
        }
      }

      // 4. Update local storage
      updateUserProfileService(current.id, updatedUser)
      setCurrentUser(updatedUser)

      // 5. Update Zustand state
      const allUsers = get().users
      const updatedUsers = allUsers.map((u) =>
        u.id === current.id || sameEmail(u.email, current.email) ? updatedUser : u
      )
      set({ user: updatedUser, users: updatedUsers })

      toast.success('Your profile details have been updated successfully.', 'Profile Updated')
      return { success: true, user: updatedUser }
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err)
      toast.error(errMsg, 'Update Failed')
      return { success: false, error: errMsg }
    }
  },
}))
