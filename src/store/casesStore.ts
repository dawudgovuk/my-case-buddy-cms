import { create } from 'zustand';
import type { FamilyCase, User } from '../types/domain';
import {
  loadSnapshot,
  saveSnapshot,
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

import { getCurrentUser } from '../services/auth';

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
      // Keep local snapshot strictly aligned with the live API state
      saveSnapshot((prev) => ({ ...prev, cases: strapiCases }));
      set({ cases: strapiCases, isLoadingStrapi: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch from Strapi';
      // Graceful fallback to local snapshot on network failure
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
        const currentUser = getCurrentUser() || undefined;
        const savedCase = isExisting
          ? await updateStrapiCase(fc, currentUser)
          : await createStrapiCase(fc, currentUser);

        if (savedCase) {
          // Merge incoming savedCase members with original fc members so client-side user ownership is never lost
          const mergedMembers = [...(savedCase.members || [])];
          (fc.members || []).forEach((origM) => {
            if (!mergedMembers.some((m) => m.userId === origM.userId || (origM.email && m.email === origM.email))) {
              mergedMembers.push(origM);
            }
          });
          const hydratedCase: FamilyCase = {
            ...savedCase,
            members: mergedMembers.length > 0 ? mergedMembers : fc.members,
          };

          upsertCase(hydratedCase);
          set((state) => {
            const exists = state.cases.some(
              (c) => c.id === hydratedCase.id || (Boolean(hydratedCase.documentId) && c.documentId === hydratedCase.documentId)
            );
            return {
              cases: exists
                ? state.cases.map((c) =>
                    c.id === hydratedCase.id || (Boolean(hydratedCase.documentId) && c.documentId === hydratedCase.documentId)
                      ? hydratedCase
                      : c
                  )
                : [hydratedCase, ...state.cases],
              isLoadingStrapi: false,
              strapiError: null,
            };
          });
          return hydratedCase;
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

// Auto-trigger background hydration with Strapi on initial app startup
if (isStrapiEnabled()) {
  setTimeout(() => {
    void useCasesStore.getState().syncWithStrapi();
  }, 0);
}



