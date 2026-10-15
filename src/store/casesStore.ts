import { create } from 'zustand';
import type { FamilyCase, User } from '../types/domain';
import {
  loadSnapshot,
  upsertCase,
  deleteCase,
  getCase,
  toggleCasePeerSupport,
  createInvite,
  generateId,
} from '../services/storage';
import {
  isStrapiEnabled,
  setStrapiEnabled,
  fetchStrapiCases,
  createStrapiCase,
  updateStrapiCase,
  deleteStrapiCase,
  toggleStrapiPeerSupport,
  requestStrapiPeerSupport,
} from '../services/strapi';

interface CasesState {
  cases: FamilyCase[];
  isStrapiMode: boolean;
  isLoadingStrapi: boolean;
  strapiError: string | null;
  refresh: () => void;
  setStrapiMode: (enabled: boolean) => void;
  syncWithStrapi: () => Promise<void>;
  addOrUpdate: (fc: FamilyCase) => Promise<FamilyCase>;
  remove: (caseId: string) => void;
  getById: (caseId: string) => FamilyCase | undefined;
  togglePeerSupport: (caseId: string, seeking: boolean, note?: string) => void;
  requestPeerSupport: (caseId: string, targetProfessional: User, note?: string) => Promise<FamilyCase>;
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
    if (get().isLoadingStrapi) return;
    set({ isLoadingStrapi: true, strapiError: null });
    try {
      const strapiCases = await fetchStrapiCases();
      // Mirror fetched cases into local snapshot for resilient offline availability
      strapiCases.forEach((c) => upsertCase(c));
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

  addOrUpdate: async (fc: FamilyCase): Promise<FamilyCase> => {
    // Determine whether this case already exists before any mutation
    const isExisting = Boolean(
      get().cases.some((c) => c.id === fc.id || (Boolean(fc.documentId) && c.documentId === fc.documentId)) ||
      getCase(fc.id)
    );

    // Optimistic persistence to local snapshot and Zustand store
    upsertCase(fc);
    set((state) => {
      const exists = state.cases.some((c) => c.id === fc.id || (Boolean(fc.documentId) && c.documentId === fc.documentId));
      return {
        cases: exists
          ? state.cases.map((c) => (c.id === fc.id || (Boolean(fc.documentId) && c.documentId === fc.documentId) ? fc : c))
          : [fc, ...state.cases],
        strapiError: null,
      };
    });

    if (get().isStrapiMode) {
      set({ isLoadingStrapi: true });
      try {
        const savedCase = isExisting ? await updateStrapiCase(fc) : await createStrapiCase(fc);
        if (savedCase) {
          upsertCase(savedCase);
          set((state) => {
            const exists = state.cases.some(
              (c) => c.id === savedCase.id || (Boolean(savedCase.documentId) && c.documentId === savedCase.documentId)
            );
            return {
              cases: exists
                ? state.cases.map((c) =>
                    c.id === savedCase.id || (Boolean(savedCase.documentId) && c.documentId === savedCase.documentId)
                      ? savedCase
                      : c
                  )
                : [savedCase, ...state.cases],
              isLoadingStrapi: false,
              strapiError: null,
            };
          });
          return savedCase;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Strapi sync failed';
        set({ strapiError: message, isLoadingStrapi: false });
        throw err;
      } finally {
        set({ isLoadingStrapi: false });
      }
    }

    return fc;
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
    return getCase(caseId) ?? get().cases.find((c) => c.id === caseId || c.documentId === caseId);
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

  requestPeerSupport: async (caseId: string, targetProfessional: User, note?: string): Promise<FamilyCase> => {
    const existing = get().getById(caseId);
    const helpNote = note && note.trim().length > 0
      ? note.trim()
      : `Peer support requested from ${targetProfessional.name} (${targetProfessional.role})`;

    // 1. Optimistic update to local snapshot
    if (existing) {
      const updatedCase: FamilyCase = {
        ...existing,
        seekingPeerSupport: true,
        peerSupportNote: helpNote,
        peerSupportRequestedAt: new Date().toISOString(),
        notes: [
          ...existing.notes,
          {
            id: generateId('NOTE'),
            createdAt: new Date().toISOString(),
            author: 'Case Litigant',
            text: `Peer support requested from ${targetProfessional.name} (${targetProfessional.role}${targetProfessional.firm ? ` - ${targetProfessional.firm}` : ''}). Help needed: ${helpNote}`,
          },
        ],
        lastUpdatedAt: new Date().toISOString(),
      };

      upsertCase(updatedCase);

      if (targetProfessional.role !== 'LIP') {
        createInvite({
          id: generateId('INV'),
          caseId: existing.id,
          token: generateId('TOK'),
          role: targetProfessional.role,
          createdBy: 'owner',
          createdAt: new Date().toISOString(),
        });
      }

      set({ cases: loadSnapshot().cases, strapiError: null });
    }

    // 2. If Strapi mode, transmit via Strapi API
    if (get().isStrapiMode) {
      set({ isLoadingStrapi: true });
      try {
        const result = await requestStrapiPeerSupport(caseId, targetProfessional.id, helpNote);
        if (result.case) {
          upsertCase(result.case);
          const currentCases = get().cases;
          const updatedList = currentCases.some(
            (c) => c.id === result.case!.id || (result.case!.documentId && c.documentId === result.case!.documentId)
          )
            ? currentCases.map((c) =>
                c.id === result.case!.id || (result.case!.documentId && c.documentId === result.case!.documentId)
                  ? result.case!
                  : c
              )
            : [...currentCases, result.case];

          set({
            cases: updatedList,
            isLoadingStrapi: false,
            strapiError: null,
          });
          return result.case;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Strapi peer support request failed';
        set({ strapiError: message, isLoadingStrapi: false });
        throw err;
      } finally {
        set({ isLoadingStrapi: false });
      }
    }

    return get().getById(caseId) || existing || ({} as FamilyCase);
  },
}));


