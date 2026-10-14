import { loadSnapshot } from '../storage';
import { createStrapiCase } from './casesApiService';
import { createStrapiDeadline } from './deadlinesApiService';
import { createStrapiInvite } from './invitesApiService';
import { checkStrapiHealth } from './strapiConfig';
import type { FamilyCase, DocumentDeadline, CaseInvite } from '../../types/domain';

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
 * Migrates all cases, child relations, invites, and deadlines from browser LocalStorage snapshot into Strapi.
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
  const deadlinesToMigrate: DocumentDeadline[] = snapshot.deadlines || [];
  const invitesToMigrate: CaseInvite[] = snapshot.invites || [];

  const total = casesToMigrate.length + deadlinesToMigrate.length + invitesToMigrate.length;

  if (total === 0) {
    return {
      success: true,
      totalMigrated: 0,
      failedCount: 0,
      errors: ['No records found in LocalStorage to migrate.'],
    };
  }

  const errors: string[] = [];
  let migratedCount = 0;
  let step = 0;

  // 1. Migrate cases with nested relations
  for (const currentCase of casesToMigrate) {
    step++;
    onProgress?.({
      current: step,
      total,
      currentCaseTitle: `Case: ${currentCase.title}`,
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

  // 2. Migrate deadlines
  for (const deadline of deadlinesToMigrate) {
    step++;
    onProgress?.({
      current: step,
      total,
      currentCaseTitle: `Deadline: ${deadline.title}`,
      status: 'running',
      errors,
    });

    try {
      await createStrapiDeadline({
        caseId: deadline.caseId,
        title: deadline.title,
        description: deadline.description,
        deadlineDate: deadline.deadlineDate,
        documentType: deadline.documentType,
        status: deadline.status,
        assignedTo: deadline.assignedTo,
      });
      migratedCount++;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Deadline "${deadline.title}": ${errMsg}`);
    }
  }

  // 3. Migrate active invites
  for (const invite of invitesToMigrate) {
    step++;
    onProgress?.({
      current: step,
      total,
      currentCaseTitle: `Invite: ${invite.role}`,
      status: 'running',
      errors,
    });

    try {
      await createStrapiInvite(invite.caseId, invite.role, invite.createdBy);
      migratedCount++;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Invite (${invite.token}): ${errMsg}`);
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
