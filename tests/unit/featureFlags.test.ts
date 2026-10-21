import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isComponentShowcaseEnabled } from '../../src/utils/featureFlags';

test('isComponentShowcaseEnabled returns true when VITE_ENABLE_COMPONENT_SHOWCASE is "true" or "1"', () => {
  assert.equal(isComponentShowcaseEnabled({ VITE_ENABLE_COMPONENT_SHOWCASE: 'true' }), true);
  assert.equal(isComponentShowcaseEnabled({ VITE_ENABLE_COMPONENT_SHOWCASE: '1' }), true);
  assert.equal(isComponentShowcaseEnabled({ VITE_ENABLE_COMPONENT_SHOWCASE: true }), true);
});

test('isComponentShowcaseEnabled returns false when VITE_ENABLE_COMPONENT_SHOWCASE is "false" or "0"', () => {
  assert.equal(isComponentShowcaseEnabled({ VITE_ENABLE_COMPONENT_SHOWCASE: 'false' }), false);
  assert.equal(isComponentShowcaseEnabled({ VITE_ENABLE_COMPONENT_SHOWCASE: '0' }), false);
  assert.equal(isComponentShowcaseEnabled({ VITE_ENABLE_COMPONENT_SHOWCASE: false }), false);
});

test('isComponentShowcaseEnabled supports VITE_ENABLE_COMPONENTS_PAGE alias', () => {
  assert.equal(isComponentShowcaseEnabled({ VITE_ENABLE_COMPONENTS_PAGE: 'true' }), true);
  assert.equal(isComponentShowcaseEnabled({ VITE_ENABLE_COMPONENTS_PAGE: 'false' }), false);
});

test('isComponentShowcaseEnabled falls back to DEV flag when env variable is not set', () => {
  assert.equal(isComponentShowcaseEnabled({ DEV: true }), true);
  assert.equal(isComponentShowcaseEnabled({ DEV: false }), false);
  assert.equal(isComponentShowcaseEnabled({}), false);
});
