import { create } from 'zustand';
import type {
  GuidanceMap,
  GuidanceJourney,
  GuidanceStep,
  GuidanceArticle,
  RoadmapProgress,
} from '../types/guidance';
import {
  fetchGuidanceMaps,
  fetchGuidanceMapBySlug,
  fetchGuidanceArticleBySlug,
} from '../services/strapi';

const STORAGE_KEY_COMPLETED_STEPS = 'mcb_guidance_completed_steps';
const STORAGE_KEY_CASE_MAP_LINKS = 'mcb_case_guidance_map_links';

function loadStoredCompletedSteps(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETED_STEPS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredCompletedSteps(record: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY_COMPLETED_STEPS, JSON.stringify(record));
  } catch (err) {
    console.warn('Failed to save completed steps to localStorage:', err);
  }
}

function loadStoredCaseMapLinks(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CASE_MAP_LINKS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredCaseMapLinks(record: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY_CASE_MAP_LINKS, JSON.stringify(record));
  } catch (err) {
    console.warn('Failed to save case map links to localStorage:', err);
  }
}

interface GuidanceState {
  maps: GuidanceMap[];
  activeMap: GuidanceMap | null;
  activeJourney: GuidanceJourney | null;
  activeStep: GuidanceStep | null;
  activeArticle: GuidanceArticle | null;
  completedSteps: Record<string, boolean>;
  caseMapLinks: Record<string, string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadGuidance: () => Promise<void>;
  setActiveMapBySlug: (slug: string) => Promise<GuidanceMap | null>;
  setActiveJourneyBySlug: (slug: string) => GuidanceJourney | null;
  setActiveStepBySlug: (slug: string) => GuidanceStep | null;
  loadArticleBySlug: (slug: string) => Promise<GuidanceArticle | null>;
  toggleStepCompletion: (stepSlug: string) => void;
  isStepCompleted: (stepSlug: string) => boolean;
  linkCaseToMap: (caseId: string, mapSlug: string) => void;
  unlinkCaseFromMap: (caseId: string) => void;
  getMapForCase: (caseId: string) => GuidanceMap | undefined;
  getProgress: (mapSlug?: string) => RoadmapProgress;
}

export const useGuidanceStore = create<GuidanceState>((set, get) => ({
  maps: [],
  activeMap: null,
  activeJourney: null,
  activeStep: null,
  activeArticle: null,
  completedSteps: loadStoredCompletedSteps(),
  caseMapLinks: loadStoredCaseMapLinks(),
  isLoading: false,
  error: null,

  loadGuidance: async () => {
    set({ isLoading: true, error: null });
    try {
      const maps = await fetchGuidanceMaps();
      set({
        maps,
        isLoading: false,
        activeMap: get().activeMap || (maps.length > 0 ? maps[0] : null),
        activeJourney:
          get().activeJourney ||
          (maps.length > 0 && maps[0].journeys.length > 0 ? maps[0].journeys[0] : null),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load guidance maps';
      set({ isLoading: false, error: msg });
    }
  },

  setActiveMapBySlug: async (slug: string) => {
    const existing = get().maps.find((m) => m.slug === slug);
    if (existing) {
      set({
        activeMap: existing,
        activeJourney: existing.journeys.length > 0 ? existing.journeys[0] : null,
        activeStep:
          existing.journeys.length > 0 && existing.journeys[0].steps.length > 0
            ? existing.journeys[0].steps[0]
            : null,
      });
      return existing;
    }

    set({ isLoading: true, error: null });
    try {
      const map = await fetchGuidanceMapBySlug(slug);
      if (map) {
        set({
          activeMap: map,
          activeJourney: map.journeys.length > 0 ? map.journeys[0] : null,
          activeStep:
            map.journeys.length > 0 && map.journeys[0].steps.length > 0
              ? map.journeys[0].steps[0]
              : null,
          isLoading: false,
        });
        return map;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load map';
      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
    return null;
  },

  setActiveJourneyBySlug: (slug: string) => {
    const activeMap = get().activeMap;
    if (!activeMap) return null;

    const journey = activeMap.journeys.find((j) => j.slug === slug) || null;
    if (journey) {
      set({
        activeJourney: journey,
        activeStep: journey.steps.length > 0 ? journey.steps[0] : null,
      });
    }
    return journey;
  },

  setActiveStepBySlug: (slug: string) => {
    const activeJourney = get().activeJourney;
    if (!activeJourney) return null;

    const step = activeJourney.steps.find((s) => s.slug === slug) || null;
    if (step) {
      set({ activeStep: step });
    }
    return step;
  },

  loadArticleBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const article = await fetchGuidanceArticleBySlug(slug);
      set({ activeArticle: article, isLoading: false });
      return article;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load guidance article';
      set({ error: msg, isLoading: false });
      return null;
    }
  },

  toggleStepCompletion: (stepSlug: string) => {
    const current = get().completedSteps;
    const updated = {
      ...current,
      [stepSlug]: !current[stepSlug],
    };
    saveStoredCompletedSteps(updated);
    set({ completedSteps: updated });
  },

  isStepCompleted: (stepSlug: string) => {
    return Boolean(get().completedSteps[stepSlug]);
  },

  linkCaseToMap: (caseId: string, mapSlug: string) => {
    const updated = {
      ...get().caseMapLinks,
      [caseId]: mapSlug,
    };
    saveStoredCaseMapLinks(updated);
    set({ caseMapLinks: updated });
  },

  unlinkCaseFromMap: (caseId: string) => {
    const updated = { ...get().caseMapLinks };
    delete updated[caseId];
    saveStoredCaseMapLinks(updated);
    set({ caseMapLinks: updated });
  },

  getMapForCase: (caseId: string) => {
    const mapSlug = get().caseMapLinks[caseId];
    if (!mapSlug) return undefined;
    return get().maps.find((m) => m.slug === mapSlug);
  },

  getProgress: (mapSlug?: string): RoadmapProgress => {
    const targetMap = mapSlug
      ? get().maps.find((m) => m.slug === mapSlug)
      : get().activeMap;

    if (!targetMap || !targetMap.journeys) {
      return { totalSteps: 0, completedSteps: 0, percentage: 0 };
    }

    const allSteps = targetMap.journeys.flatMap((j) => j.steps);
    const totalSteps = allSteps.length;
    if (totalSteps === 0) {
      return { totalSteps: 0, completedSteps: 0, percentage: 0 };
    }

    const completed = allSteps.filter((s) => get().completedSteps[s.slug]).length;
    const percentage = Math.round((completed / totalSteps) * 100);

    return {
      totalSteps,
      completedSteps: completed,
      percentage,
    };
  },
}));
