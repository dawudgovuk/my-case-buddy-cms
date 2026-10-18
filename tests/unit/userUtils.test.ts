import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appUserFromNeon, findUserByEmail, isProfessionalRole, sameEmail, toStrapiUsername } from '../../src/utils/userUtils';
import { getErrorMessage } from '../../src/utils/errors';

test('sameEmail and findUserByEmail ignore case', () => {
  assert.equal(sameEmail('A@X.test', 'a@x.test'), true);
  const users = [{ id: '1', name: 'A', email: 'Jo@X.test', role: 'LIP' as const }];
  assert.equal(findUserByEmail(users, 'jo@x.test')?.id, '1');
  assert.equal(findUserByEmail(users, 'other@x.test'), undefined);
});

test('isProfessionalRole accepts only legal professional roles', () => {
  for (const role of ['Solicitor', 'Barrister', 'McKenzieFriend']) assert.equal(isProfessionalRole(role), true);
  for (const role of ['LIP', '', undefined, null]) assert.equal(isProfessionalRole(role), false);
});

test('appUserFromNeon creates an LIP and falls back to the given name', () => {
  const user = appUserFromNeon({ id: 'n1', name: '', email: 'jo@x.test', emailVerified: true }, 'jo');
  assert.deepEqual(user, { id: 'n1', name: 'jo', email: 'jo@x.test', role: 'LIP', isVerified: true });
});

test('toStrapiUsername normalises the base and adds a 4-character suffix', () => {
  assert.match(toStrapiUsername('  Jo Ann Smith '), /^jo_ann_smith_[a-z0-9]{1,4}$/);
});

test('getErrorMessage prefers Error.message, then the fallback, then String()', () => {
  assert.equal(getErrorMessage(new Error('boom'), 'fallback'), 'boom');
  assert.equal(getErrorMessage('oops', 'fallback'), 'fallback');
  assert.equal(getErrorMessage('oops'), 'oops');
});
