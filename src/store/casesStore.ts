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
import { toast } from './toastStore';
import { getErrorMessage } from '../utils/errors';
import { isSameCase, mergeCaseMembers, upsertCaseInList } from '../utils/caseCollection';

interface CasesState {
  cases: FamilyCase[];
  isStrapiMode: boolean;
  isLoadingStrapi: boolean;
  strapiError: string | null;
  refresh: () => void;
  setStrapiMode: (enabled: boolean) => void;
  syncWithStrapi: () => Promise<void>;
  addOrUpdate: (fc: FamilyCase, previousId?: string) => Promise<FamilyCase>;
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
      toast.info('Switched to Live Strapi API mode.', 'API Mode Changed');
      void get().syncWithStrapi();
    } else {
      toast.info('Switched to Local Snapshot mode.', 'Storage Mode Changed');
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
      const message = getErrorMessage(err, 'Failed to fetch from Strapi');
      // Graceful fallback to local snapshot on network failure
      set({
        cases: loadSnapshot().cases,
        isLoadingStrapi: false,
        strapiError: message,
      });
    }
  },

  addOrUpdate: async (fc: FamilyCase, previousId?: string): Promise<FamilyCase> => {
    // Determine whether this case already exists before any mutation
    const isExisting = Boolean(
      (previousId && (get().cases.some((c) => c.id === previousId) || getCase(previousId))) ||
      get().cases.some((c) => isSameCase(c, fc)) ||
      getCase(fc.id)
    );

    // Optimistic persistence to local snapshot and Zustand store
    upsertCase(fc, previousId);
    set((state) => {
      const list = previousId && previousId !== fc.id
        ? state.cases.filter((c) => c.id !== previousId)
        : state.cases;
      return { cases: upsertCaseInList(list, fc), strapiError: null };
    });

    if (get().isStrapiMode) {
      set({ isLoadingStrapi: true });
      try {
        const currentUser = getCurrentUser() || undefined;
        const savedCase = isExisting
          ? await updateStrapiCase(fc, currentUser)
          : await createStrapiCase(fc, currentUser);

        if (savedCase) {
          // Client-side ownership must never be lost when the server omits members
          const hydratedCase = mergeCaseMembers(savedCase, fc);
          upsertCase(hydratedCase, previousId);
          set((state) => {
            const list = previousId && previousId !== hydratedCase.id
              ? state.cases.filter((c) => c.id !== previousId)
              : state.cases;
            return {
              cases: upsertCaseInList(list, hydratedCase),
              isLoadingStrapi: false,
              strapiError: null,
            };
          });
          return hydratedCase;
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err, 'Strapi sync failed');
        set({ strapiError: message, isLoadingStrapi: false });
        throw err;
      } finally {
        set({ isLoadingStrapi: false });
      }
    }

    return fc;
  },

  remove: (caseId: string) => {
    const existing = get().getById(caseId);
    const caseTitle = existing?.title || caseId;
    deleteCase(caseId);
    set({ cases: loadSnapshot().cases });
    toast.success(`Case "${caseTitle}" was permanently deleted.`, 'Case Deleted');

    if (get().isStrapiMode) {
      deleteStrapiCase(caseId).catch((err: unknown) => {
        const message = getErrorMessage(err, 'Strapi deletion failed');
        set({ strapiError: message });
        toast.error(`Remote deletion failed: ${message}`, 'Strapi Error');
      });
    }
  },

  getById: (caseId: string) => {
    return (
      getCase(caseId) ??
      get().cases.find((c) => c.id === caseId || c.documentId === caseId || c.caseNumber === caseId)
    );
  },

  togglePeerSupport: (caseId: string, seeking: boolean, note?: string) => {
    const existing = get().getById(caseId);
    const caseTitle = existing?.title || caseId;
    toggleCasePeerSupport(caseId, seeking, note);
    set({ cases: loadSnapshot().cases });

    if (seeking) {
      toast.success(`"${caseTitle}" is now seeking legal peer support.`, 'Peer Support Active');
    } else {
      toast.info(`Peer support request turned off for "${caseTitle}".`, 'Peer Support Deactivated');
    }

    if (get().isStrapiMode) {
      toggleStrapiPeerSupport(caseId, seeking, note).catch((err: unknown) => {
        const message = getErrorMessage(err, 'Strapi peer support update failed');
        set({ strapiError: message });
        toast.error(`Failed to update peer support in Strapi: ${message}`, 'Strapi Error');
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
      toast.success(
        `Peer support request sent to ${targetProfessional.name} (${targetProfessional.role}).`,
        'Support Requested'
      );
    }

    // 2. If Strapi mode, transmit via Strapi API
    if (get().isStrapiMode) {
      set({ isLoadingStrapi: true });
      try {
        const result = await requestStrapiPeerSupport(caseId, targetProfessional.id, helpNote);
        if (result.case) {
          upsertCase(result.case);
          set({
            cases: upsertCaseInList(get().cases, result.case, 'end'),
            isLoadingStrapi: false,
            strapiError: null,
          });
          return result.case;
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err, 'Strapi peer support request failed');
        set({ strapiError: message, isLoadingStrapi: false });
        toast.error(`Peer support request failed: ${message}`, 'Request Error');
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
