import { create } from 'zustand';
import type { FamilyCase } from '../types/domain';
import { loadSnapshot, upsertCase, deleteCase, getCase } from '../services/storage';

interface CasesState {
  cases: FamilyCase[];
  refresh: () => void;
  addOrUpdate: (fc: FamilyCase) => void;
  remove: (caseId: string) => void;
  getById: (caseId: string) => FamilyCase | undefined;
}

export const useCasesStore = create<CasesState>((set, get) => ({
  cases: loadSnapshot().cases,
  refresh: () => {
    set({ cases: loadSnapshot().cases });
  },
  addOrUpdate: (fc: FamilyCase) => {
    upsertCase(fc);
    set({ cases: loadSnapshot().cases });
  },
  remove: (caseId: string) => {
    deleteCase(caseId);
    set({ cases: loadSnapshot().cases });
  },
  getById: (caseId: string) => {
    return getCase(caseId) ?? get().cases.find((c) => c.id === caseId);
  },
}));


