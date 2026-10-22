import type { AppStateSnapshot, FamilyCase, CaseInvite, DocumentDeadline } from '../types/domain';
import { isDemoUser } from './auth';
import { SNAPSHOT_STORAGE_KEY as STORAGE_KEY } from './storageKeys';

const VERSION = 2;

function nowIso(): string {
  return new Date().toISOString();
}

export function loadSnapshot(): AppStateSnapshot {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const empty: AppStateSnapshot = {
      version: VERSION,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      cases: [],
      invites: [],
      deadlines: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    return empty;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<AppStateSnapshot>;
    const rawCases = parsed.cases ?? [];
    const cleanCases = rawCases.filter((c) => {
      const hasDemoMember = Boolean(c.members?.some((m) => isDemoUser({ id: m.userId, email: m.email })));
      const isDemoSeeded = typeof c.caseNumber === 'string' && c.caseNumber.startsWith('FC-') && c.id.startsWith('case_');
      return !hasDemoMember && !isDemoSeeded;
    });

    if (cleanCases.length !== rawCases.length) {
      parsed.cases = cleanCases;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    if (parsed.version !== VERSION) {
      // Migration: add invites and deadlines if missing
      const migrated: AppStateSnapshot = {
        version: VERSION,
        createdAt: parsed.createdAt ?? nowIso(),
        updatedAt: nowIso(),
        cases: cleanCases,
        invites: parsed.invites ?? [],
        deadlines: parsed.deadlines ?? [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return { ...parsed, cases: cleanCases } as AppStateSnapshot;
  } catch {
    const reset: AppStateSnapshot = {
      version: VERSION,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      cases: [],
      invites: [],
      deadlines: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    return reset;
  }
}

export function saveSnapshot(update: (prev: AppStateSnapshot) => AppStateSnapshot): AppStateSnapshot {
  const prev = loadSnapshot();
  const next = update(prev);
  const normalized: AppStateSnapshot = {
    ...next,
    version: VERSION,
    updatedAt: nowIso(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function upsertCase(fc: FamilyCase, previousId?: string): AppStateSnapshot {
  return saveSnapshot((prev) => {
    const existsIndex = prev.cases.findIndex(
      (c) =>
        c.id === fc.id ||
        (Boolean(previousId) && c.id === previousId) ||
        (Boolean(fc.documentId) && c.documentId === fc.documentId) ||
        (Boolean(fc.caseNumber) && c.caseNumber === fc.caseNumber)
    );
    const cases = [...prev.cases];
    if (existsIndex >= 0) {
      cases[existsIndex] = { ...fc, lastUpdatedAt: nowIso() };
    } else {
      cases.unshift({ ...fc, lastUpdatedAt: nowIso() });
    }

    let invites = prev.invites;
    let deadlines = prev.deadlines;
    if (previousId && previousId !== fc.id) {
      invites = invites.map((inv) => (inv.caseId === previousId ? { ...inv, caseId: fc.id } : inv));
      deadlines = deadlines.map((dl) => (dl.caseId === previousId ? { ...dl, caseId: fc.id } : dl));
    }

    return { ...prev, cases, invites, deadlines };
  });
}

export function deleteCase(caseId: string): AppStateSnapshot {
  return saveSnapshot((prev) => ({
    ...prev,
    cases: prev.cases.filter((c) => c.id !== caseId && c.documentId !== caseId && c.caseNumber !== caseId),
  }));
}

export function getCase(caseId: string): FamilyCase | undefined {
  return loadSnapshot().cases.find((c) => c.id === caseId || c.documentId === caseId || c.caseNumber === caseId);
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

export function createInvite(invite: CaseInvite): AppStateSnapshot {
  return saveSnapshot((prev) => ({
    ...prev,
    invites: [...prev.invites, invite],
  }));
}

export function getInviteByToken(token: string): CaseInvite | undefined {
  return loadSnapshot().invites.find((i) => i.token === token);
}

export function updateInvite(inviteId: string, updates: Partial<CaseInvite>): AppStateSnapshot {
  return saveSnapshot((prev) => ({
    ...prev,
    invites: prev.invites.map((i) => (i.id === inviteId ? { ...i, ...updates } : i)),
  }));
}

export function deleteInvite(inviteIdOrToken: string): AppStateSnapshot {
  return saveSnapshot((prev) => ({
    ...prev,
    invites: prev.invites.filter((i) => i.id !== inviteIdOrToken && i.token !== inviteIdOrToken),
  }));
}

export function createDeadline(deadline: DocumentDeadline): AppStateSnapshot {
  return saveSnapshot((prev) => ({
    ...prev,
    deadlines: [...prev.deadlines, deadline],
  }));
}

export function updateDeadline(deadlineId: string, updates: Partial<DocumentDeadline>): AppStateSnapshot {
  return saveSnapshot((prev) => ({
    ...prev,
    deadlines: prev.deadlines.map((d) => (d.id === deadlineId ? { ...d, ...updates } : d)),
  }));
}

export function getDeadlinesForCase(caseId: string): DocumentDeadline[] {
  return loadSnapshot().deadlines.filter((d) => d.caseId === caseId);
}

export function getDeadlinesForUser(userId: string): DocumentDeadline[] {
  return loadSnapshot().deadlines.filter((d) => d.assignedTo === userId);
}

export function getAllInvites(): CaseInvite[] {
  return loadSnapshot().invites;
}

export function getAllDeadlines(): DocumentDeadline[] {
  return loadSnapshot().deadlines;
}

export function getPeerSupportCases(): FamilyCase[] {
  return loadSnapshot().cases.filter((c) => Boolean(c.seekingPeerSupport));
}

export function toggleCasePeerSupport(caseId: string, seeking: boolean, note?: string): FamilyCase | undefined {
  let updated: FamilyCase | undefined;
  saveSnapshot((prev) => {
    const cases = prev.cases.map((c) => {
      if (c.id === caseId) {
        updated = {
          ...c,
          seekingPeerSupport: seeking,
          peerSupportNote: note !== undefined ? note : c.peerSupportNote,
          peerSupportRequestedAt: seeking ? (c.peerSupportRequestedAt || nowIso()) : undefined,
          lastUpdatedAt: nowIso(),
        };
        return updated;
      }
      return c;
    });
    return { ...prev, cases };
  });
  return updated;
}
