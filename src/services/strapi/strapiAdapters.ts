import type {
  FamilyCase,
  Party,
  Hearing,
  OrderRecord,
  DocumentRecord,
  CaseNote,
  CaseMember,
  DocumentDeadline,
  CourtType,
  CaseType,
  CaseStatus,
  HearingType,
  OrderType,
} from '../../types/domain';

export interface StrapiCaseRaw {
  id: number;
  documentId?: string;
  caseNumber?: string;
  title?: string;
  court?: string;
  caseType?: string;
  status?: string;
  startedAt?: string;
  allocatedJudge?: string;
  currentStage?: string;
  childrenInvolved?: number;
  seekingPeerSupport?: boolean;
  peerSupportNote?: string;
  peerSupportRequestedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  parties?: StrapiPartyRaw[];
  hearings?: StrapiHearingRaw[];
  orders?: StrapiOrderRaw[];
  documents?: StrapiDocumentRaw[];
  notes?: StrapiNoteRaw[];
  members?: StrapiMemberRaw[];
  deadlines?: StrapiDeadlineRaw[];
  attributes?: Record<string, unknown>;
}

export interface StrapiPartyRaw {
  id: number;
  documentId?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  address?: string;
  solicitorFirm?: string;
  solicitorContact?: string;
  contactEmail?: string;
  contactPhone?: string;
  attributes?: Record<string, unknown>;
}

export interface StrapiHearingRaw {
  id: number;
  documentId?: string;
  type?: string;
  date?: string;
  time?: string;
  location?: string;
  judge?: string;
  notes?: string;
  outcome?: string;
  attributes?: Record<string, unknown>;
}

export interface StrapiOrderRaw {
  id: number;
  documentId?: string;
  type?: string;
  dateMade?: string;
  summary?: string;
  expiresOn?: string;
  documentUrl?: string;
  attributes?: Record<string, unknown>;
}

export interface StrapiDocumentRaw {
  id: number;
  documentId?: string;
  title?: string;
  type?: string;
  uploadedAt?: string;
  url?: string;
  notes?: string;
  attributes?: Record<string, unknown>;
}

export interface StrapiNoteRaw {
  id: number;
  documentId?: string;
  createdAt?: string;
  author?: string;
  text?: string;
  attributes?: Record<string, unknown>;
}

export interface StrapiMemberRaw {
  id: number;
  documentId?: string;
  username?: string;
  email?: string;
  userRole?: string;
  attributes?: Record<string, unknown>;
}

export interface StrapiDeadlineRaw {
  id: number;
  documentId?: string;
  title?: string;
  description?: string;
  deadlineDate?: string;
  documentType?: string;
  status?: string;
  submittedAt?: string;
  case?: { id?: number; documentId?: string; caseNumber?: string };
  assignedTo?: { id?: number; documentId?: string; username?: string };
  attributes?: Record<string, unknown>;
}

function unwrap<T extends { attributes?: Record<string, unknown> }>(item: T): Record<string, unknown> {
  if (item.attributes && typeof item.attributes === 'object') {
    return { ...item.attributes, id: (item as { id?: unknown }).id };
  }
  return item as unknown as Record<string, unknown>;
}

export function toDomainParty(raw: StrapiPartyRaw): Party {
  const data = unwrap(raw);
  return {
    id: String(data.id ?? raw.id ?? raw.documentId ?? ''),
    role: (data.role as Party['role']) || 'Applicant',
    firstName: String(data.firstName || ''),
    lastName: String(data.lastName || ''),
    dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth) : undefined,
    address: data.address ? String(data.address) : undefined,
    solicitorFirm: data.solicitorFirm ? String(data.solicitorFirm) : undefined,
    solicitorContact: data.solicitorContact ? String(data.solicitorContact) : undefined,
    contactEmail: data.contactEmail ? String(data.contactEmail) : undefined,
    contactPhone: data.contactPhone ? String(data.contactPhone) : undefined,
  };
}

export function toDomainHearing(raw: StrapiHearingRaw): Hearing {
  const data = unwrap(raw);
  return {
    id: String(data.id ?? raw.id ?? raw.documentId ?? ''),
    type: (data.type as HearingType) || 'Case Management',
    date: String(data.date || new Date().toISOString().slice(0, 10)),
    time: data.time ? String(data.time) : undefined,
    location: data.location ? String(data.location) : undefined,
    judge: data.judge ? String(data.judge) : undefined,
    notes: data.notes ? String(data.notes) : undefined,
    outcome: data.outcome ? String(data.outcome) : undefined,
  };
}

export function toDomainOrder(raw: StrapiOrderRaw): OrderRecord {
  const data = unwrap(raw);
  return {
    id: String(data.id ?? raw.id ?? raw.documentId ?? ''),
    type: (data.type as OrderType) || 'Other',
    dateMade: String(data.dateMade || new Date().toISOString().slice(0, 10)),
    summary: String(data.summary || ''),
    expiresOn: data.expiresOn ? String(data.expiresOn) : undefined,
    documentUrl: data.documentUrl ? String(data.documentUrl) : undefined,
  };
}

export function toDomainDocument(raw: StrapiDocumentRaw): DocumentRecord {
  const data = unwrap(raw);
  return {
    id: String(data.id ?? raw.id ?? raw.documentId ?? ''),
    title: String(data.title || 'Untitled Document'),
    type: (data.type as DocumentRecord['type']) || 'Other',
    uploadedAt: String(data.uploadedAt || data.createdAt || new Date().toISOString()),
    url: String(data.url || ''),
    notes: data.notes ? String(data.notes) : undefined,
  };
}

export function toDomainNote(raw: StrapiNoteRaw): CaseNote {
  const data = unwrap(raw);
  return {
    id: String(data.id ?? raw.id ?? raw.documentId ?? ''),
    createdAt: String(data.createdAt || new Date().toISOString()),
    author: String(data.author || 'Author'),
    text: String(data.text || ''),
  };
}

export function toDomainMember(raw: StrapiMemberRaw): CaseMember {
  const data = unwrap(raw);
  return {
    userId: String(data.id ?? raw.id ?? raw.documentId ?? ''),
    role: (data.userRole as CaseMember['role']) || 'Collaborator',
  };
}

export function toDomainDeadline(raw: StrapiDeadlineRaw, caseIdFallback?: string): DocumentDeadline {
  const data = unwrap(raw);
  const caseRel = data.case as { caseNumber?: string; id?: number; documentId?: string } | undefined;
  return {
    id: String(data.id ?? raw.id ?? raw.documentId ?? ''),
    caseId: caseRel?.caseNumber || (caseRel?.documentId ? String(caseRel.documentId) : caseIdFallback || ''),
    title: String(data.title || 'Document Deadline'),
    description: data.description ? String(data.description) : undefined,
    deadlineDate: String(data.deadlineDate || new Date().toISOString().slice(0, 10)),
    documentType: data.documentType ? String(data.documentType) : undefined,
    status: (data.status as DocumentDeadline['status']) || 'pending',
    assignedTo: data.assignedTo ? String((data.assignedTo as { id?: unknown }).id || '') : undefined,
    submittedAt: data.submittedAt ? String(data.submittedAt) : undefined,
  };
}

export function toDomainCase(raw: StrapiCaseRaw): FamilyCase {
  const data = unwrap(raw);
  const rawParties = Array.isArray(data.parties) ? (data.parties as StrapiPartyRaw[]) : [];
  const rawHearings = Array.isArray(data.hearings) ? (data.hearings as StrapiHearingRaw[]) : [];
  const rawOrders = Array.isArray(data.orders) ? (data.orders as StrapiOrderRaw[]) : [];
  const rawDocs = Array.isArray(data.documents) ? (data.documents as StrapiDocumentRaw[]) : [];
  const rawNotes = Array.isArray(data.notes) ? (data.notes as StrapiNoteRaw[]) : [];
  const rawMembers = Array.isArray(data.members) ? (data.members as StrapiMemberRaw[]) : [];

  return {
    id: String(data.caseNumber || data.id || raw.documentId || ''),
    title: String(data.title || 'Untitled Case'),
    court: (data.court as CourtType) || 'Family Court',
    caseType: (data.caseType as CaseType) || 'Private Law (Child Arrangements)',
    status: (data.status as CaseStatus) || 'Open',
    startedAt: String(data.startedAt || new Date().toISOString().slice(0, 10)),
    allocatedJudge: data.allocatedJudge ? String(data.allocatedJudge) : undefined,
    currentStage: data.currentStage ? String(data.currentStage) : undefined,
    childrenInvolved: typeof data.childrenInvolved === 'number' ? data.childrenInvolved : 0,
    parties: rawParties.map(toDomainParty),
    hearings: rawHearings.map(toDomainHearing),
    orders: rawOrders.map(toDomainOrder),
    documents: rawDocs.map(toDomainDocument),
    notes: rawNotes.map(toDomainNote),
    members: rawMembers.map(toDomainMember),
    seekingPeerSupport: Boolean(data.seekingPeerSupport),
    peerSupportNote: data.peerSupportNote ? String(data.peerSupportNote) : undefined,
    peerSupportRequestedAt: data.peerSupportRequestedAt ? String(data.peerSupportRequestedAt) : undefined,
    lastUpdatedAt: String(data.updatedAt || data.createdAt || new Date().toISOString()),
  };
}

export function toStrapiCasePayload(fc: FamilyCase): { data: Record<string, unknown> } {
  return {
    data: {
      caseNumber: fc.id,
      title: fc.title,
      court: fc.court,
      caseType: fc.caseType,
      status: fc.status,
      startedAt: fc.startedAt,
      allocatedJudge: fc.allocatedJudge,
      currentStage: fc.currentStage,
      childrenInvolved: fc.childrenInvolved ?? 0,
      seekingPeerSupport: Boolean(fc.seekingPeerSupport),
      peerSupportNote: fc.peerSupportNote,
      peerSupportRequestedAt: fc.peerSupportRequestedAt,
      parties: (fc.parties || []).map((p) => ({
        documentId: p.id.startsWith('PTY_') ? undefined : p.id,
        role: p.role,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        address: p.address,
        solicitorFirm: p.solicitorFirm,
        solicitorContact: p.solicitorContact,
        contactEmail: p.contactEmail,
        contactPhone: p.contactPhone,
      })),
      hearings: (fc.hearings || []).map((h) => ({
        documentId: h.id.startsWith('HRG_') ? undefined : h.id,
        type: h.type,
        date: h.date,
        time: h.time,
        location: h.location,
        judge: h.judge,
        notes: h.notes,
        outcome: h.outcome,
      })),
      orders: (fc.orders || []).map((o) => ({
        documentId: o.id.startsWith('ORD_') ? undefined : o.id,
        type: o.type,
        dateMade: o.dateMade,
        summary: o.summary,
        expiresOn: o.expiresOn,
        documentUrl: o.documentUrl,
      })),
      documents: (fc.documents || []).map((d) => ({
        documentId: d.id.startsWith('DOC_') ? undefined : d.id,
        title: d.title,
        type: d.type,
        uploadedAt: d.uploadedAt,
        url: d.url,
        notes: d.notes,
      })),
      notes: (fc.notes || []).map((n) => ({
        documentId: n.id.startsWith('NOTE_') ? undefined : n.id,
        author: n.author,
        text: n.text,
      })),
    },
  };
}
