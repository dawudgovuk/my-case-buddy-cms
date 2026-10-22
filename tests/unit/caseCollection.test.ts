import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { FamilyCase } from '../../src/types/domain';
import { isSameCase, mergeCaseMembers, upsertCaseInList } from '../../src/utils/caseCollection';

const makeCase = (overrides: Partial<FamilyCase>): FamilyCase =>
  ({ id: 'C1', title: 'Case', parties: [], hearings: [], orders: [], documents: [], notes: [], ...overrides }) as FamilyCase;

test('isSameCase matches by id, by documentId, or by caseNumber when present', () => {
  assert.equal(isSameCase(makeCase({ id: 'A' }), makeCase({ id: 'A' })), true);
  assert.equal(isSameCase(makeCase({ id: 'A', documentId: 'd1' }), makeCase({ id: 'B', documentId: 'd1' })), true);
  assert.equal(
    isSameCase(
      makeCase({ id: 'CASE_123', caseNumber: '1792 1487 9533 6269' }),
      makeCase({ id: '1792 1487 9533 6269', caseNumber: '1792 1487 9533 6269' })
    ),
    true
  );
  assert.equal(isSameCase(makeCase({ id: 'A' }), makeCase({ id: 'B' })), false);
  // A missing documentId never matches another missing documentId
  assert.equal(isSameCase(makeCase({ id: 'A' }), makeCase({ id: 'B', documentId: undefined })), false);
});

test('upsertCaseInList replaces in place or inserts at the requested end', () => {
  const a = makeCase({ id: 'A' });
  const b = makeCase({ id: 'B' });
  const a2 = makeCase({ id: 'A', title: 'Updated' });
  assert.deepEqual(upsertCaseInList([a, b], a2).map((c) => c.title), ['Updated', 'Case']);
  assert.deepEqual(upsertCaseInList([a], b).map((c) => c.id), ['B', 'A']);
  assert.deepEqual(upsertCaseInList([a], b, 'end').map((c) => c.id), ['A', 'B']);
});

test('mergeCaseMembers keeps client members the server omitted', () => {
  const saved = makeCase({ members: [{ userId: 'u1', role: 'Owner', email: 'a@x.test' }] });
  const original = makeCase({
    members: [
      { userId: 'u1', role: 'Owner', email: 'a@x.test' },
      { userId: 'u2', role: 'McKenzieFriend', email: 'b@x.test' },
    ],
  });
  assert.deepEqual(mergeCaseMembers(saved, original).members?.map((m) => m.userId), ['u1', 'u2']);
  assert.deepEqual(mergeCaseMembers(makeCase({ members: [] }), makeCase({ members: undefined })).members, undefined);
});
