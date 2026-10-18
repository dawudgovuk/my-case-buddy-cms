import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WELCOME_ROUTE, getLandingRoute } from '../../src/utils/authConstants';

test('signed-out visitors land on sign in', () => {
  assert.equal(getLandingRoute(null), '/login');
  assert.equal(getLandingRoute(undefined), '/login');
});

test('unverified accounts land on the welcome / verify-email page, whatever their role', () => {
  for (const role of ['LIP', 'McKenzieFriend', 'Solicitor', 'Barrister'] as const) {
    assert.equal(getLandingRoute({ role, isVerified: false }), WELCOME_ROUTE);
    assert.equal(getLandingRoute({ role }), WELCOME_ROUTE);
  }
});

test('verified accounts land on their dashboard', () => {
  assert.equal(getLandingRoute({ role: 'LIP', isVerified: true }), '/cases');
  assert.equal(getLandingRoute({ role: 'Solicitor', isVerified: true }), '/professional-dashboard');
});
