import { loadSnapshot } from '../storage';
import { createStrapiCase } from './casesApiService';
import { checkStrapiHealth } from './strapiConfig';
import type { FamilyCase } from '../../types/domain';

export interface MigrationProgress {
  current: number;
  total: number;
  currentCaseTitle: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  errors: string[];
}

export interface MigrationResult {
  success: boolean;
  totalMigrated: number;
  failedCount: number;
  errors: string[];
}

/**
 * Migrates all cases and their related entities from browser LocalStorage snapshot into Strapi.
 */
export async function migrateLocalStorageToStrapi(
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationResult> {
  const health = await checkStrapiHealth();
  if (!health.ok) {
    throw new Error(`Cannot connect to Strapi server: ${health.message}. Please ensure Strapi is running.`);
  }

  const snapshot = loadSnapshot();
  const casesToMigrate: FamilyCase[] = snapshot.cases || [];
  const total = casesToMigrate.length;

  if (total === 0) {
    return {
      success: true,
      totalMigrated: 0,
      failedCount: 0,
      errors: ['No cases found in LocalStorage to migrate.'],
    };
  }

  const errors: string[] = [];
  let migratedCount = 0;

  for (let i = 0; i < total; i++) {
    const currentCase = casesToMigrate[i];
    onProgress?.({
      current: i + 1,
      total,
      currentCaseTitle: currentCase.title,
      status: 'running',
      errors,
    });

    try {
      await createStrapiCase(currentCase);
      migratedCount++;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Case "${currentCase.title}" (${currentCase.id}): ${errMsg}`);
    }
  }

  const success = errors.length === 0;

  onProgress?.({
    current: total,
    total,
    currentCaseTitle: 'Migration Complete',
    status: success ? 'completed' : 'failed',
    errors,
  });

  return {
    success,
    totalMigrated: migratedCount,
    failedCount: errors.length,
    errors,
  };
}
