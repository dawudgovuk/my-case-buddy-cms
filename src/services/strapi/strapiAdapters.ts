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
  RemotePlatform,
  ComplianceDeadline,
  PartyRepresentation,
} from '../../types/domain';
import { unwrapEntry as unwrap } from './strapiTypes';

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
  representation?: string;
  parentalResponsibility?: boolean;
  schoolOrNursery?: string;
  specialMeasuresRequired?: string;
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
  outcomeSummary?: string;
  remotePlatform?: string;
  remoteLink?: string;
  specialMeasures?: string;
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
  hasPenalNotice?: boolean;
  warningNotice?: string;
  complianceDeadlines?: unknown[];
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
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status?: string;
  pageCount?: number;
  exhibitRef?: string;
  attributes?: Record<string, unknown>;
}

export interface StrapiNoteRaw {
  id: number;
  documentId?: string;
  createdAt?: string;
  author?: string;
  text?: string;
  category?: string;
  attributes?: Record<string, unknown>;
}

export interface StrapiMemberRaw {
  id: number;
  documentId?: string;
  username?: string;
  email?: string;
  userRole?: string;
  firm?: string;
  name?: string;
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

export function toDomainParty(raw: StrapiPartyRaw): Party {
  const data = unwrap(raw);
  return {
    id: String(raw.documentId ?? data.documentId ?? data.id ?? raw.id ?? ''),
    role: (data.role as Party['role']) || 'Applicant',
    firstName: String(data.firstName || ''),
    lastName: String(data.lastName || ''),
    dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth) : undefined,
    address: data.address ? String(data.address) : undefined,
    solicitorFirm: data.solicitorFirm ? String(data.solicitorFirm) : undefined,
    solicitorContact: data.solicitorContact ? String(data.solicitorContact) : undefined,
    contactEmail: data.contactEmail ? String(data.contactEmail) : undefined,
    contactPhone: data.contactPhone ? String(data.contactPhone) : undefined,
    representation: (data.representation as PartyRepresentation) || undefined,
    parentalResponsibility: typeof data.parentalResponsibility === 'boolean' ? data.parentalResponsibility : undefined,
    schoolOrNursery: data.schoolOrNursery ? String(data.schoolOrNursery) : undefined,
    specialMeasuresRequired: data.specialMeasuresRequired ? String(data.specialMeasuresRequired) : undefined,
  };
}

export function toDomainHearing(raw: StrapiHearingRaw): Hearing {
  const data = unwrap(raw);
  return {
    id: String(raw.documentId ?? data.documentId ?? data.id ?? raw.id ?? ''),
    type: (data.type as HearingType) || 'Case Management',
    date: String(data.date || new Date().toISOString().slice(0, 10)),
    time: data.time ? String(data.time) : undefined,
    location: data.location ? String(data.location) : undefined,
    judge: data.judge ? String(data.judge) : undefined,
    notes: data.notes ? String(data.notes) : undefined,
    outcome: data.outcome ? String(data.outcome) : undefined,
    outcomeSummary: data.outcomeSummary ? String(data.outcomeSummary) : undefined,
    remotePlatform: (data.remotePlatform as RemotePlatform) || undefined,
    remoteLink: data.remoteLink ? String(data.remoteLink) : undefined,
    specialMeasures: data.specialMeasures ? String(data.specialMeasures) : undefined,
  };
}

export function toDomainOrder(raw: StrapiOrderRaw): OrderRecord {
  const data = unwrap(raw);
  return {
    id: String(raw.documentId ?? data.documentId ?? data.id ?? raw.id ?? ''),
    type: (data.type as OrderType) || 'Other',
    dateMade: String(data.dateMade || new Date().toISOString().slice(0, 10)),
    summary: String(data.summary || ''),
    expiresOn: data.expiresOn ? String(data.expiresOn) : undefined,
    documentUrl: data.documentUrl ? String(data.documentUrl) : undefined,
    hasPenalNotice: Boolean(data.hasPenalNotice),
    warningNotice: data.warningNotice ? String(data.warningNotice) : undefined,
    complianceDeadlines: Array.isArray(data.complianceDeadlines)
      ? (data.complianceDeadlines as ComplianceDeadline[])
      : undefined,
  };
}

export function toDomainDocument(raw: StrapiDocumentRaw): DocumentRecord {
  const data = unwrap(raw);
  return {
    id: String(raw.documentId ?? data.documentId ?? data.id ?? raw.id ?? ''),
    title: String(data.title || 'Untitled Document'),
    type: (data.type as DocumentRecord['type']) || 'Other',
    uploadedAt: String(data.uploadedAt || data.createdAt || new Date().toISOString()),
    url: String(data.url || ''),
    notes: data.notes ? String(data.notes) : undefined,
    fileName: data.fileName ? String(data.fileName) : undefined,
    fileSize: typeof data.fileSize === 'number' ? data.fileSize : undefined,
    mimeType: data.mimeType ? String(data.mimeType) : undefined,
    status: (data.status as DocumentRecord['status']) || undefined,
    pageCount: typeof data.pageCount === 'number' ? data.pageCount : undefined,
    exhibitRef: data.exhibitRef ? String(data.exhibitRef) : undefined,
  };
}

export function toDomainNote(raw: StrapiNoteRaw): CaseNote {
  const data = unwrap(raw);
  return {
    id: String(raw.documentId ?? data.documentId ?? data.id ?? raw.id ?? ''),
    createdAt: String(data.createdAt || new Date().toISOString()),
    author: String(data.author || 'Author'),
    text: String(data.text || ''),
    category: data.category ? String(data.category) : undefined,
  };
}

export function toDomainMember(raw: StrapiMemberRaw): CaseMember {
  const data = unwrap(raw);
  const email = (data.email as string | undefined)?.toLowerCase();
  const name =
    (data.name as string | undefined) ||
    (data.username as string | undefined) ||
    (email ? email.split('@')[0] : undefined);
  return {
    userId: String(raw.documentId ?? data.documentId ?? data.id ?? raw.id ?? ''),
    documentId: raw.documentId || (data.documentId as string | undefined),
    role: (data.userRole as CaseMember['role']) || 'Collaborator',
    email,
    name,
    username: data.username as string | undefined,
    firm: (data.firm as string | undefined),
  };
}

export function toDomainDeadline(raw: StrapiDeadlineRaw, caseIdFallback?: string): DocumentDeadline {
  const data = unwrap(raw);
  const caseRel = data.case as { caseNumber?: string; id?: number; documentId?: string } | undefined;
  return {
    id: String(raw.documentId ?? data.documentId ?? data.id ?? raw.id ?? ''),
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
  const members = rawMembers.map(toDomainMember);

  // Auto-link case owner as a single Owner member entry
  if (data.owner && typeof data.owner === 'object') {
    const ownerData = unwrap(data.owner as StrapiMemberRaw);
    const ownerId = String(
      (data.owner as { documentId?: string }).documentId ??
      ownerData.documentId ??
      (data.owner as { id?: unknown }).id ??
      ownerData.id ??
      ''
    );
    const ownerEmail = ((ownerData.email || (data.owner as { email?: string }).email) as string | undefined)?.toLowerCase();
    const ownerName = (
      ownerData.name ||
      (data.owner as { name?: string }).name ||
      ownerData.username ||
      (data.owner as { username?: string }).username ||
      (ownerEmail ? ownerEmail.split('@')[0] : 'Owner')
    ) as string | undefined;

    const existingOwnerIndex = members.findIndex(
      (m) => (ownerEmail && m.email === ownerEmail) || m.userId === ownerId
    );

    if (existingOwnerIndex === -1) {
      members.unshift({
        userId: ownerId,
        documentId: (data.owner as { documentId?: string }).documentId ?? (ownerData.documentId as string | undefined),
        role: 'Owner',
        email: ownerEmail,
        name: ownerName,
        username: (ownerData.username || (data.owner as { username?: string }).username) as string | undefined,
      });
    } else {
      members[existingOwnerIndex].role = 'Owner';
      if (!members[existingOwnerIndex].name && ownerName) {
        members[existingOwnerIndex].name = ownerName;
      }
      if (!members[existingOwnerIndex].email && ownerEmail) {
        members[existingOwnerIndex].email = ownerEmail;
      }
    }
  }

  return {
    id: String(data.caseNumber || raw.documentId || data.documentId || data.id || ''),
    documentId: raw.documentId || (data.documentId as string | undefined),
    caseNumber: data.caseNumber ? String(data.caseNumber) : undefined,
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
    members,
    seekingPeerSupport: Boolean(data.seekingPeerSupport),
    peerSupportNote: data.peerSupportNote ? String(data.peerSupportNote) : undefined,
    peerSupportRequestedAt: data.peerSupportRequestedAt ? String(data.peerSupportRequestedAt) : undefined,
    lastUpdatedAt: String(data.updatedAt || data.createdAt || new Date().toISOString()),
  };
}

export function toStrapiCasePayload(
  fc: FamilyCase,
  currentUser?: { id?: string; email?: string },
  isUpdate = false
): { data: Record<string, unknown> } {
  const ownerEmail = isUpdate
    ? undefined
    : currentUser?.email || fc.members?.find((m) => m.email || m.userId?.includes('@'))?.email;
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
      ownerEmail: ownerEmail || undefined,
      parties: (fc.parties || []).map((p) => ({
        documentId: p.id && !p.id.startsWith('PTY_') ? p.id : undefined,
        role: p.role,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        address: p.address,
        solicitorFirm: p.solicitorFirm,
        solicitorContact: p.solicitorContact,
        contactEmail: p.contactEmail,
        contactPhone: p.contactPhone,
        representation: p.representation,
        parentalResponsibility: p.parentalResponsibility,
        schoolOrNursery: p.schoolOrNursery,
        specialMeasuresRequired: p.specialMeasuresRequired,
      })),
      hearings: (fc.hearings || []).map((h) => ({
        documentId: h.id && !h.id.startsWith('HRG_') ? h.id : undefined,
        type: h.type,
        date: h.date,
        time: h.time,
        location: h.location,
        judge: h.judge,
        notes: h.notes,
        outcome: h.outcome,
        outcomeSummary: h.outcomeSummary,
        remotePlatform: h.remotePlatform,
        remoteLink: h.remoteLink,
        specialMeasures: h.specialMeasures,
      })),
      orders: (fc.orders || []).map((o) => ({
        documentId: o.id && !o.id.startsWith('ORD_') ? o.id : undefined,
        type: o.type,
        dateMade: o.dateMade,
        summary: o.summary,
        expiresOn: o.expiresOn,
        documentUrl: o.documentUrl,
        hasPenalNotice: Boolean(o.hasPenalNotice),
        warningNotice: o.warningNotice,
        complianceDeadlines: o.complianceDeadlines,
      })),
      documents: (fc.documents || []).map((d) => ({
        documentId: d.id && !d.id.startsWith('DOC_') ? d.id : undefined,
        title: d.title,
        type: d.type,
        uploadedAt: d.uploadedAt,
        url: d.url,
        notes: d.notes,
        fileName: d.fileName,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
        status: d.status,
        pageCount: d.pageCount,
        exhibitRef: d.exhibitRef,
      })),
      notes: (fc.notes || []).map((n) => ({
        documentId: n.id && !n.id.startsWith('NOTE_') ? n.id : undefined,
        author: n.author,
        text: n.text,
        category: n.category,
      })),
    },
  };
}
