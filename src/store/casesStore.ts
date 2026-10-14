import { create } from 'zustand';
import type { FamilyCase } from '../types/domain';
import {
  loadSnapshot,
  upsertCase,
  deleteCase,
  getCase,
  toggleCasePeerSupport,
} from '../services/storage';
import {
  isStrapiEnabled,
  setStrapiEnabled,
  fetchStrapiCases,
  createStrapiCase,
  updateStrapiCase,
  deleteStrapiCase,
  toggleStrapiPeerSupport,
} from '../services/strapi';

interface CasesState {
  cases: FamilyCase[];
  isStrapiMode: boolean;
  isLoadingStrapi: boolean;
  strapiError: string | null;
  refresh: () => void;
  setStrapiMode: (enabled: boolean) => void;
  syncWithStrapi: () => Promise<void>;
  addOrUpdate: (fc: FamilyCase) => void;
  remove: (caseId: string) => void;
  getById: (caseId: string) => FamilyCase | undefined;
  togglePeerSupport: (caseId: string, seeking: boolean, note?: string) => void;
}

export const useCasesStore = create<CasesState>((set, get) => ({
  cases: loadSnapshot().cases,
  isStrapiMode: isStrapiEnabled(),
  isLoadingStrapi: false,
  strapiError: null,

  refresh: () => {
    if (get().isStrapiMode) {
      void get().syncWithStrapi();
    } else {
      set({ cases: loadSnapshot().cases });
    }
  },

  setStrapiMode: (enabled: boolean) => {
    setStrapiEnabled(enabled);
    set({ isStrapiMode: enabled, strapiError: null });
    if (enabled) {
      void get().syncWithStrapi();
    } else {
      set({ cases: loadSnapshot().cases });
    }
  },

  syncWithStrapi: async () => {
    set({ isLoadingStrapi: true, strapiError: null });
    try {
      const strapiCases = await fetchStrapiCases();
      set({ cases: strapiCases, isLoadingStrapi: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch from Strapi';
      // Graceful fallback to local snapshot on error
      set({
        cases: loadSnapshot().cases,
        isLoadingStrapi: false,
        strapiError: message,
      });
    }
  },

  addOrUpdate: (fc: FamilyCase) => {
    upsertCase(fc);
    set({ cases: loadSnapshot().cases });

    if (get().isStrapiMode) {
      const isExisting = loadSnapshot().cases.some((c) => c.id === fc.id);
      const action = isExisting ? updateStrapiCase(fc) : createStrapiCase(fc);
      action
        .then((savedCase) => {
          if (savedCase) {
            upsertCase(savedCase);
            set({ cases: loadSnapshot().cases });
          }
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Strapi sync failed';
          set({ strapiError: message });
        });
    }
  },

  remove: (caseId: string) => {
    deleteCase(caseId);
    set({ cases: loadSnapshot().cases });

    if (get().isStrapiMode) {
      deleteStrapiCase(caseId).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Strapi deletion failed';
        set({ strapiError: message });
      });
    }
  },

  getById: (caseId: string) => {
    return getCase(caseId) ?? get().cases.find((c) => c.id === caseId);
  },

  togglePeerSupport: (caseId: string, seeking: boolean, note?: string) => {
    toggleCasePeerSupport(caseId, seeking, note);
    set({ cases: loadSnapshot().cases });

    if (get().isStrapiMode) {
      toggleStrapiPeerSupport(caseId, seeking, note).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Strapi peer support update failed';
        set({ strapiError: message });
      });
    }
  },
}));
