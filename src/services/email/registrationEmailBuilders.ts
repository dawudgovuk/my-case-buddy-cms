import type { UserRole } from '../../types/domain'
import type { DispatchedEmail } from '../../types/email'
import { LIP_COURT_GUIDANCE, MCKENZIE_PRACTICE_GUIDANCE } from '../../utils/registrationGuidance'

/**
 * Generates the official Registration Confirmation Email.
 */
export function buildRegistrationConfirmationEmail(params: {
  name: string
  email: string
  role?: UserRole
  referenceId: string
}): DispatchedEmail {
  const { name, email, role = 'LIP', referenceId } = params
  const isLIP = role === 'LIP'
  const roleDisplay = role === 'McKenzieFriend' ? 'McKenzie Friend' : isLIP ? 'Litigant in Person' : role
  const now = new Date().toISOString()
  const guidance = isLIP ? LIP_COURT_GUIDANCE : MCKENZIE_PRACTICE_GUIDANCE

  return {
    id: `email_conf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    recipientEmail: email,
    recipientName: name,
    role,
    type: 'registration_confirmation',
    subject: `Registration Confirmed: Welcome to My Case Buddy (${roleDisplay})`,
    sender: 'support@mycasebuddy.justice.gov.uk',
    sentAt: now,
    status: 'delivered',
    referenceId,
    previewText: `Welcome to My Case Buddy! Your registration as a ${roleDisplay} has been confirmed. Ref: ${referenceId}`,
    guidelinesSummary: guidance,
    bodyText: isLIP
      ? `Dear ${name},

Thank you for registering as a Litigant in Person with My Case Buddy (Registration Reference: ${referenceId}).

Your account has been registered to help you organize and manage your Family Court proceedings, child arrangements, hearing dates, and position statements under England and Wales Family Procedure Rules (FPR).

YOUR RIGHTS & CAPABILITIES:
- Direct access to create and manage Family Court cases and hearing timelines.
- Right to seek moral support and quiet assistance from a McKenzie Friend.
- Assist with compiling digital bundles and evidence for the court.
- Present your case and explain your circumstances directly to the judge.

KEY SAFEGUARDING RULES:
- Maintain strict confidentiality of all private family proceedings under FPR Rule 12.73.
- Do not disclose child details or court documents to unauthorized third parties.
- Comply with all court-ordered filing dates and directions.

NEXT STEPS:
To activate your profile, you must verify your email address. A separate Verification Email containing your secure activation link has been sent to this inbox.

Warm regards,
My Case Buddy Support Team
HMCTS Family Justice Support`
      : `Dear ${name},

Thank you for registering as a ${roleDisplay} with My Case Buddy (Registration Reference: ${referenceId}).

Your application has been logged in our registry. As a ${roleDisplay} assisting Litigants in Person in England and Wales Family Courts, your participation is governed by the Family Procedure Rules (FPR) and the Practice Guidance issued by the Head of Family Justice (July 2010).

WHAT YOU CAN DO:
- Provide moral support, encouragement, and calm reassurance to the litigant.
- Take comprehensive notes of evidence, submissions, and judge's comments.
- Quietly advise the litigant on procedural points, issues, and questions for witnesses.
- Assist in organizing the digital and paper court bundles.

WHAT YOU MUST NOT DO:
- You cannot act as an advocate or address the court unless explicit rights of audience are granted by the bench.
- You cannot sign court pleadings, witness statements, or documents for the litigant.
- You must maintain strict confidentiality of all private family proceedings under FPR Rule 12.73.

NEXT STEPS:
To activate your profile and unlock the peer directory to assist litigants, you must verify your email address. A separate Verification Email containing your secure activation link has been sent to this inbox.

Warm regards,
My Case Buddy Support Team
HMCTS Family Justice Support`,
  }
}

/**
 * Generates the official Account Verification Email.
 */
export function buildVerificationEmail(params: {
  name: string
  email: string
  role?: UserRole
  token: string
  referenceId: string
  verificationUrl?: string
}): DispatchedEmail {
  const { name, email, role = 'LIP', token, referenceId, verificationUrl } = params
  const isLIP = role === 'LIP'
  const roleDisplay = role === 'McKenzieFriend' ? 'McKenzie Friend' : isLIP ? 'Litigant in Person' : role
  const resolvedUrl =
    verificationUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/verify-email/${token}`
      : `http://localhost:5173/verify-email/${token}`)
  const now = new Date().toISOString()

  return {
    id: `email_verif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    recipientEmail: email,
    recipientName: name,
    role,
    type: 'email_verification',
    subject: `Action Required: Verify your ${roleDisplay} account`,
    sender: 'safeguarding@mycasebuddy.justice.gov.uk',
    sentAt: now,
    status: 'delivered',
    referenceId,
    verificationToken: token,
    verificationUrl: resolvedUrl,
    previewText: `Action Required: Confirm your email address to activate your ${roleDisplay} account under UK Family Court safeguarding rules.`,
    bodyText: `Dear ${name},

Action Required: Email Verification for ${roleDisplay} Account

Under UK Family Procedure Rules (FPR Part 12) and UK GDPR safeguarding regulations, all account holders must confirm their email address before accessing case materials or offering assistance.

Click the link below to verify your email address and activate your account:
${resolvedUrl}

Verification Token: ${token}
Security Notice: This link is valid for 24 hours. Once verified, your status will update to "Verified ${roleDisplay}".

If you did not request this registration, please disregard this email or report to safeguarding@mycasebuddy.justice.gov.uk.

Kind regards,
Safeguarding & Identity Governance Office
My Case Buddy UK`,
  }
}
