/**
 * Types for the UK Family Court Legal Guidance & Roadmap Engine
 * Reflects the 3-Tiered Information Architecture:
 * - Map: "Where do I start?"
 * - Journey: "What do I need to do?"
 * - Step & Article: "How do I do it?"
 */

export type ReferenceType = 'Form' | 'Document' | 'Web' | 'Video' | 'Case';

export interface GuidanceReference {
  id: string;
  name: string;
  slug: string;
  url: string;
  type: ReferenceType;
  keywords?: string;
}

export interface GuidanceArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  keywords?: string;
  category?: string;
  references?: GuidanceReference[];
}

export type StepStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

export interface GuidanceStep {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isConditional: boolean;
  conditionCriteria?: string;
  category?: string;
  articles?: GuidanceArticle[];
  status?: StepStatus;
}

export interface GuidanceJourney {
  id: string;
  name: string;
  slug: string;
  description: string;
  type?: string;
  order: number;
  steps: GuidanceStep[];
}

export interface GuidanceMap {
  id: string;
  name: string;
  slug: string;
  description: string;
  category?: string;
  preconditions?: string;
  postconditions?: string;
  journeys: GuidanceJourney[];
}

export interface RoadmapProgress {
  totalSteps: number;
  completedSteps: number;
  percentage: number;
}
