import { describe, it } from 'node:test'
import assert from 'node:assert'
import { getStagesForCase, getCurrentStageIndex } from '../../src/utils/caseStages.ts'
import type { FamilyCase } from '../../src/types/domain.ts'

describe('caseStages and dynamic metadata', () => {
  const mockCase: FamilyCase = {
    id: '1792 1487 9533 6269',
    title: 'Test Dynamic Case',
    court: 'Family Court',
    caseType: 'Financial Remedies',
    status: 'Open',
    startedAt: '2026-10-21',
    currentStage: 'fdr',
    parties: [],
    hearings: [],
    orders: [],
    documents: [],
    notes: [],
    lastUpdatedAt: '2026-10-21T08:00:00.000Z',
  }

  it('retrieves default stages when no custom map is provided', () => {
    const stages = getStagesForCase(mockCase)
    assert.strictEqual(stages.length, 5)
    assert.strictEqual(stages[0].id, 'application')
    assert.strictEqual(stages[3].id, 'fdr')
  })

  it('calculates current stage index accurately', () => {
    const index = getCurrentStageIndex(mockCase)
    assert.strictEqual(index, 3) // fdr is index 3 in Financial Remedies
  })

  it('supports custom dynamic stages map from database', () => {
    const customMap = {
      'Financial Remedies': [
        { id: 'custom-1', name: 'Custom Stage 1', description: 'Desc 1', order: 1 },
        { id: 'custom-2', name: 'Custom Stage 2', description: 'Desc 2', order: 2 },
      ],
    }
    const stages = getStagesForCase(mockCase, customMap)
    assert.strictEqual(stages.length, 2)
    assert.strictEqual(stages[0].id, 'custom-1')
    assert.strictEqual(stages[1].name, 'Custom Stage 2')
  })

  it('supports novel case types created in database', () => {
    const novelCase: FamilyCase = {
      ...mockCase,
      caseType: 'International Child Abduction (Hague Convention)',
      currentStage: 'return-order',
    }
    const customMap = {
      'International Child Abduction (Hague Convention)': [
        { id: 'os-application', name: 'Originating Summons', description: 'Filing', order: 1 },
        { id: 'return-order', name: 'Return Order Hearing', description: 'Hearing', order: 2 },
      ],
    }
    const stages = getStagesForCase(novelCase, customMap)
    assert.strictEqual(stages.length, 2)
    assert.strictEqual(stages[1].name, 'Return Order Hearing')

    const index = getCurrentStageIndex(novelCase, stages)
    assert.strictEqual(index, 1)
  })
})
