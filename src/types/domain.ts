export type CourtType =
  | 'Family Court'
  | 'High Court Family Division';

export type CaseType =
  | 'Public Law (Care Proceedings)'
  | 'Private Law (Child Arrangements)'
  | 'Domestic Abuse (Non-Molestation)'
  | 'Financial Remedies'
  | 'Adoption'
  | 'Other';

export type CaseStatus =
  | 'Open'
  | 'Stayed'
  | 'Concluded';

export interface Party {
  id: string;
  role:
    | 'Applicant'
    | 'Respondent'
    | 'Child'
    | 'Guardian'
    | 'Intervener';
  firstName: string;
  lastName: string;
  dateOfBirth?: string; // ISO date
  address?: string;
  solicitorFirm?: string;
  solicitorContact?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export type HearingType =
  | 'Case Management'
  | 'Directions'
  | 'Fact-Finding'
  | 'Final'
  | 'Other';

export interface Hearing {
  id: string;
  type: HearingType;
  date: string; // ISO date
  time?: string; // HH:mm
  location?: string;
  judge?: string;
  notes?: string;
  outcome?: string;
}

export type OrderType =
  | 'Child Arrangements Order'
  | 'Care Order'
  | 'Supervision Order'
  | 'Non-Molestation Order'
  | 'Prohibited Steps Order'
  | 'Specific Issue Order'
  | 'Financial Remedies Order'
  | 'Other';

export interface OrderRecord {
  id: string;
  type: OrderType;
  dateMade: string; // ISO date
  summary: string;
  expiresOn?: string; // ISO date
  documentUrl?: string; // link to uploaded doc (placeholder)
}

export type DocumentFilingStatus = 'Draft' | 'Filed' | 'Served';

export interface DocumentRecord {
  id: string;
  title: string;
  type:
    | 'Application'
    | 'Statement'
    | 'Medical'
    | 'Expert Report'
    | 'Bundle'
    | 'Order'
    | 'Other';
  uploadedAt: string; // ISO
  url: string;
  notes?: string;
  fileName?: string;
  fileSize?: number; // In bytes
  mimeType?: string;
  status?: DocumentFilingStatus;
  pageCount?: number;
  exhibitRef?: string;
}

export interface CaseNote {
  id: string;
  createdAt: string; // ISO
  author: string;
  text: string;
}

export interface FamilyCase {
  id: string; // e.g., case number
  documentId?: string; // Strapi v5 internal document identifier
  caseNumber?: string; // HMCTS Court Case Number (e.g. FC-2026-10492)
  title: string; // short description
  court: CourtType;
  caseType: CaseType;
  status: CaseStatus;
  startedAt: string; // ISO date
  allocatedJudge?: string;
  childrenInvolved?: number;
  parties: Party[];
  hearings: Hearing[];
  orders: OrderRecord[];
  documents: DocumentRecord[];
  notes: CaseNote[];
  lastUpdatedAt: string; // ISO
  members?: CaseMember[]; // users who can access this case
  currentStage?: string; // Current stage in the case process
  seekingPeerSupport?: boolean; // Whether case owner is seeking peer-to-peer support
  peerSupportNote?: string; // Description of support needed
  peerSupportRequestedAt?: string; // ISO date
}

export interface CaseStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  completedAt?: string; // ISO date
}

export interface AppStateSnapshot {
  version: number;
  createdAt: string;
  updatedAt: string;
  cases: FamilyCase[];
  invites: CaseInvite[];
  deadlines: DocumentDeadline[];
}

export type UserRole = 'LIP' | 'McKenzieFriend' | 'Solicitor' | 'Barrister';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  firm?: string; // For Solicitor/Barrister
  registrationNumber?: string; // Professional registration number
  isVerified?: boolean; // Email verification status
  verificationToken?: string; // Token for email verification link
  lastVerifiedToken?: string; // Last successfully verified token for idempotent verification page loads
  verificationSentAt?: string; // ISO date when verification email was sent
  bio?: string;
  specialisms?: string[];
  yearsExperience?: number;
  phone?: string;
  location?: string;
}

export type CaseMemberRole = 'Owner' | 'Collaborator' | 'McKenzieFriend' | 'Solicitor' | 'Barrister';

export interface CaseMember {
  userId: string;
  role: CaseMemberRole;
  email?: string;
  name?: string;
  username?: string;
  documentId?: string;
  firm?: string; // Law firm or Chambers
  phone?: string;
  invitedAt?: string; // ISO date
  invitedBy?: string; // userId
}

export interface InviteCaseSummary {
  caseNumber?: string;
  title?: string;
  court?: string;
  caseType?: string;
  currentStage?: string;
}

export interface CaseInvite {
  id: string;
  documentId?: string;
  caseId: string;
  token: string;
  role: 'McKenzieFriend' | 'Solicitor' | 'Barrister';
  createdBy: string; // userId
  createdAt: string; // ISO date
  expiresAt?: string; // ISO date
  usedAt?: string; // ISO date
  usedBy?: string; // userId
  caseSummary?: InviteCaseSummary;
}

export interface DocumentDeadline {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  deadlineDate: string; // ISO date
  documentType?: string;
  status: 'pending' | 'submitted' | 'overdue';
  assignedTo?: string; // userId
  submittedAt?: string; // ISO date
}


