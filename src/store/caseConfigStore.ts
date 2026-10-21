import { create } from 'zustand';
import {
  fetchStrapiCourtJurisdictions,
  fetchStrapiCaseTypes,
  type CourtJurisdictionDomain,
  type CaseTypeDomain,
} from '../services/strapi/caseMetadataApiService';
import { CASE_STAGES, type CaseStageInfo } from '../utils/caseStages';

const DEFAULT_COURTS: string[] = ['Family Court', 'High Court Family Division'];
const DEFAULT_CASE_TYPES: string[] = [
  'Public Law (Care Proceedings)',
  'Private Law (Child Arrangements)',
  'Domestic Abuse (Non-Molestation)',
  'Financial Remedies',
  'Adoption',
  'Other',
];

interface CaseConfigState {
  courtJurisdictions: string[];
  courtJurisdictionItems: CourtJurisdictionDomain[];
  caseTypes: string[];
  caseTypeItems: CaseTypeDomain[];
  caseStagesMap: Record<string, CaseStageInfo[]>;
  isLoading: boolean;
  isLoaded: boolean;
  loadCaseConfig: () => Promise<void>;
  getStagesForCaseType: (caseType: string) => CaseStageInfo[];
}

export const useCaseConfigStore = create<CaseConfigState>((set, get) => ({
  courtJurisdictions: DEFAULT_COURTS,
  courtJurisdictionItems: [],
  caseTypes: DEFAULT_CASE_TYPES,
  caseTypeItems: [],
  caseStagesMap: CASE_STAGES,
  isLoading: false,
  isLoaded: false,

  loadCaseConfig: async () => {
    set({ isLoading: true });
    try {
      const [courtsData, caseTypesData] = await Promise.all([
        fetchStrapiCourtJurisdictions(),
        fetchStrapiCaseTypes(),
      ]);

      const courtNames = courtsData.length > 0
        ? courtsData.map((c) => c.name)
        : DEFAULT_COURTS;

      const caseTypeNames = caseTypesData.length > 0
        ? caseTypesData.map((ct) => ct.name)
        : DEFAULT_CASE_TYPES;

      // Build dynamic caseStagesMap from database caseTypes and their stages
      const dynamicStagesMap: Record<string, CaseStageInfo[]> = { ...CASE_STAGES };
      if (caseTypesData.length > 0) {
        caseTypesData.forEach((ct) => {
          if (ct.stages && ct.stages.length > 0) {
            dynamicStagesMap[ct.name] = ct.stages.map((s) => ({
              id: s.key,
              name: s.name,
              description: s.description || '',
              order: s.order,
            }));
          }
        });
      }

      set({
        courtJurisdictions: courtNames,
        courtJurisdictionItems: courtsData,
        caseTypes: caseTypeNames,
        caseTypeItems: caseTypesData,
        caseStagesMap: dynamicStagesMap,
        isLoading: false,
        isLoaded: true,
      });
    } catch (err) {
      console.warn('Failed to load dynamic case metadata from Strapi, falling back to defaults:', err);
      set({ isLoading: false, isLoaded: true });
    }
  },

  getStagesForCaseType: (caseType: string): CaseStageInfo[] => {
    const { caseStagesMap } = get();
    return caseStagesMap[caseType] || caseStagesMap['Other'] || CASE_STAGES['Other'] || [];
  },
}));
