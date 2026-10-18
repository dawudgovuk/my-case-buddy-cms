import type { UserRole } from './domain'

export type EmailType = 'registration_confirmation' | 'email_verification'

export interface DispatchedEmail {
  id: string
  recipientEmail: string
  recipientName: string
  role: UserRole
  type: EmailType
  subject: string
  sender: string
  sentAt: string
  status: 'delivered' | 'pending' | 'failed'
  previewText: string
  referenceId: string
  verificationToken?: string
  verificationUrl?: string
  bodyText: string
  html?: string
  guidelinesSummary?: {
    allowed: string[]
    prohibited: string[]
  }
}

export interface DispatchRegistrationResult {
  confirmationEmail: DispatchedEmail
  verificationEmail: DispatchedEmail
  emails: DispatchedEmail[]
}
