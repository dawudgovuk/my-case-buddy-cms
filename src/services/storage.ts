import type { AppStateSnapshot, FamilyCase } from '../types/domain';

const STORAGE_KEY = 'uk-family-court-cms:v1';
const VERSION = 1;

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
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    return empty;
  }
  try {
    const parsed = JSON.parse(raw) as AppStateSnapshot;
    if (parsed.version !== VERSION) {
      // simple forward-compatible migration hook
      const migrated: AppStateSnapshot = {
        version: VERSION,
        createdAt: parsed.createdAt ?? nowIso(),
        updatedAt: nowIso(),
        cases: parsed.cases ?? [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch {
    const reset: AppStateSnapshot = {
      version: VERSION,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      cases: [],
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

export function upsertCase(fc: FamilyCase): AppStateSnapshot {
  return saveSnapshot((prev) => {
    const existsIndex = prev.cases.findIndex((c) => c.id === fc.id);
    const cases = [...prev.cases];
    if (existsIndex >= 0) {
      cases[existsIndex] = { ...fc, lastUpdatedAt: nowIso() };
    } else {
      cases.unshift({ ...fc, lastUpdatedAt: nowIso() });
    }
    return { ...prev, cases };
  });
}

export function deleteCase(caseId: string): AppStateSnapshot {
  return saveSnapshot((prev) => ({
    ...prev,
    cases: prev.cases.filter((c) => c.id !== caseId),
  }));
}

export function getCase(caseId: string): FamilyCase | undefined {
  return loadSnapshot().cases.find((c) => c.id === caseId);
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}


