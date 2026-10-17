import type { UserRole } from '../types/domain'
import type { DispatchRegistrationResult } from '../types/email'
import { strapiPost } from './strapi/strapiClient'
import { isStrapiEnabled } from './strapi/strapiConfig'
import { getAllDispatchedEmails, saveDispatchedEmails } from './email/dispatchedEmailLog'
import { buildRegistrationConfirmationEmail, buildVerificationEmail } from './email/registrationEmailBuilders'

export * from './email/dispatchedEmailLog'
export * from './email/registrationEmailBuilders'
export { MCKENZIE_PRACTICE_GUIDANCE, LIP_COURT_GUIDANCE } from '../utils/registrationGuidance'

/**
 * Dispatches BOTH Confirmation Email and Verification Email upon user registration.
 */
export async function dispatchMcKenzieRegistrationEmails(params: {
  name: string
  email: string
  role?: UserRole
  token: string
  referenceId?: string
  verificationUrl?: string
}): Promise<DispatchRegistrationResult> {
  const {
    name,
    email,
    role = 'LIP',
    token,
    referenceId = `${role === 'LIP' ? 'LIP-REG' : 'MF-REG'}-${Date.now().toString(36).toUpperCase()}`,
    verificationUrl,
  } = params

  // 1. Build Confirmation Email
  const confirmationEmail = buildRegistrationConfirmationEmail({
    name,
    email,
    role,
    referenceId,
  })

  // 2. Build Verification Email
  const verificationEmail = buildVerificationEmail({
    name,
    email,
    role,
    token,
    referenceId,
    verificationUrl,
  })

  // 3. Persist into Local Dispatched Emails storage
  const existing = getAllDispatchedEmails()
  const updated = [confirmationEmail, verificationEmail, ...existing]
  saveDispatchedEmails(updated)

  // 4. Optionally synchronize with Strapi headless backend if active
  if (isStrapiEnabled()) {
    try {
      await strapiPost('/api/auth-notification/send-registration-emails', {
        name,
        email,
        role,
        token,
        verificationUrl: verificationEmail.verificationUrl,
        referenceId,
      })
    } catch (err) {
      console.warn('[emailService] Strapi email notification sync note:', err)
    }
  }

  return {
    confirmationEmail,
    verificationEmail,
    emails: [confirmationEmail, verificationEmail],
  }
}

/**
 * Dispatches registration confirmation & verification emails (alias for any user role).
 */
export const dispatchRegistrationEmails = dispatchMcKenzieRegistrationEmails

/**
 * Re-dispatches fresh copies of BOTH Confirmation and Verification emails.
 */
export async function resendMcKenzieRegistrationEmails(params: {
  name: string
  email: string
  role?: UserRole
  token: string
  referenceId?: string
  verificationUrl?: string
}): Promise<DispatchRegistrationResult> {
  return dispatchMcKenzieRegistrationEmails(params)
}

/**
 * Re-dispatches registration confirmation & verification emails (alias for any user role).
 */
export const resendRegistrationEmails = resendMcKenzieRegistrationEmails;
