import { create } from 'zustand';
import {
  fetchStrapiCourtJurisdictions,
  fetchStrapiCaseTypes,
  fetchStrapiCasePresets,
  type CourtJurisdictionDomain,
  type CaseTypeDomain,
  type CasePresetDomain,
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

export const DEFAULT_CASE_PRESETS: CasePresetDomain[] = [
  {
    id: 'child-arrangements',
    presetKey: 'child-arrangements',
    label: 'Child Arrangements',
    titleTemplate: 'Application for Child Arrangements (Live With / Contact)',
    caseType: 'Private Law (Child Arrangements)',
    court: 'Family Court',
    icon: 'child',
    description: 'Residence, spend time with & holiday contact',
    order: 1,
    isActive: true,
  },
  {
    id: 'prohibited-steps',
    presetKey: 'prohibited-steps',
    label: 'Prohibited Steps Order',
    titleTemplate: 'Application for Prohibited Steps / Specific Issue Order',
    caseType: 'Private Law (Child Arrangements)',
    court: 'Family Court',
    icon: 'shield',
    description: 'Schooling, relocation, or medical decisions',
    order: 2,
    isActive: true,
  },
  {
    id: 'non-molestation',
    presetKey: 'non-molestation',
    label: 'Non-Molestation',
    titleTemplate: 'Application for Non-Molestation & Occupation Order',
    caseType: 'Domestic Abuse (Non-Molestation)',
    court: 'Family Court',
    icon: 'shield',
    description: 'Protection from domestic abuse and harassment',
    order: 3,
    isActive: true,
  },
  {
    id: 'financial-remedy',
    presetKey: 'financial-remedy',
    label: 'Financial Remedies',
    titleTemplate: 'Financial Remedy Proceedings (Form A / Consent)',
    caseType: 'Financial Remedies',
    court: 'Family Court',
    icon: 'balance',
    description: 'Maintenance, property adjustment & pensions',
    order: 4,
    isActive: true,
  },
  {
    id: 'care-proceedings',
    presetKey: 'care-proceedings',
    label: 'Care / Supervision',
    titleTemplate: 'Public Law Proceedings under Section 31 Children Act',
    caseType: 'Public Law (Care Proceedings)',
    court: 'Family Court',
    icon: 'file',
    description: 'Local authority care or supervision orders',
    order: 5,
    isActive: true,
  },
];

interface CaseConfigState {
  courtJurisdictions: string[];
  courtJurisdictionItems: CourtJurisdictionDomain[];
  caseTypes: string[];
  caseTypeItems: CaseTypeDomain[];
  casePresets: CasePresetDomain[];
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
  casePresets: DEFAULT_CASE_PRESETS,
  caseStagesMap: CASE_STAGES,
  isLoading: false,
  isLoaded: false,

  loadCaseConfig: async () => {
    set({ isLoading: true });
    try {
      const [courtsData, caseTypesData, presetsData] = await Promise.all([
        fetchStrapiCourtJurisdictions(),
        fetchStrapiCaseTypes(),
        fetchStrapiCasePresets(),
      ]);

      const courtNames = courtsData.length > 0
        ? courtsData.map((c) => c.name)
        : DEFAULT_COURTS;

      const caseTypeNames = caseTypesData.length > 0
        ? caseTypesData.map((ct) => ct.name)
        : DEFAULT_CASE_TYPES;

      const loadedPresets = presetsData.length > 0
        ? presetsData
        : DEFAULT_CASE_PRESETS;

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
        casePresets: loadedPresets,
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
