import type { DispatchedEmail } from '../../types/email'

/** Local log of emails "sent" by the app, so users can read them without a mail server. */
const DISPATCHED_EMAILS_KEY = 'mycasebuddy:dispatched_emails:v1'

/**
 * Loads all dispatched emails from localStorage.
 */
export function getAllDispatchedEmails(): DispatchedEmail[] {
  const raw = localStorage.getItem(DISPATCHED_EMAILS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Saves dispatched emails array to localStorage.
 */
export function saveDispatchedEmails(emails: DispatchedEmail[]): void {
  localStorage.setItem(DISPATCHED_EMAILS_KEY, JSON.stringify(emails))
}

/**
 * Retrieves all dispatched emails for a specific recipient email address.
 */
export function getDispatchedEmailsForUser(email: string): DispatchedEmail[] {
  if (!email) return []
  const all = getAllDispatchedEmails()
  return all.filter((e) => e.recipientEmail.toLowerCase() === email.toLowerCase())
}

/**
 * Retrieves the latest confirmation and verification email pair for a recipient.
 */
export function getLatestRegistrationEmails(email: string): {
  confirmation?: DispatchedEmail
  verification?: DispatchedEmail
} {
  const userEmails = getDispatchedEmailsForUser(email)
  const confirmation = userEmails.find((e) => e.type === 'registration_confirmation')
  const verification = userEmails.find((e) => e.type === 'email_verification')
  return { confirmation, verification }
}
