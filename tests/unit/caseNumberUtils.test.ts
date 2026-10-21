import { describe, it } from 'node:test'
import assert from 'node:assert'
import { formatCaseNumberInput, validateCaseNumber } from '../../src/utils/caseNumberUtils.ts'

describe('caseNumberUtils', () => {
  describe('formatCaseNumberInput', () => {
    it('returns empty string when given empty or null-like input', () => {
      assert.strictEqual(formatCaseNumberInput(''), '')
    })

    it('preserves internal auto-generated IDs unchanged', () => {
      assert.strictEqual(formatCaseNumberInput('CASE_b2vpiq_mvh7mwvj'), 'CASE_b2vpiq_mvh7mwvj')
      assert.strictEqual(formatCaseNumberInput('case_test123'), 'case_test123')
    })

    it('formats unformatted digits into 4x4 blocks', () => {
      assert.strictEqual(formatCaseNumberInput('1792148795336269'), '1792 1487 9533 6269')
    })

    it('strips hyphens and re-spaces into 4x4 blocks', () => {
      assert.strictEqual(formatCaseNumberInput('1792-1487-9533-6269'), '1792 1487 9533 6269')
    })

    it('formats partial input while typing', () => {
      assert.strictEqual(formatCaseNumberInput('1792'), '1792')
      assert.strictEqual(formatCaseNumberInput('17921'), '1792 1')
      assert.strictEqual(formatCaseNumberInput('17921487'), '1792 1487')
    })

    it('ignores non-digit characters', () => {
      assert.strictEqual(formatCaseNumberInput('abc 1792 xyz 1487'), '1792 1487')
    })

    it('truncates at 16 digits maximum', () => {
      assert.strictEqual(formatCaseNumberInput('179214879533626999999'), '1792 1487 9533 6269')
    })
  })

  describe('validateCaseNumber', () => {
    it('allows empty or undefined input (optional field)', () => {
      assert.strictEqual(validateCaseNumber('').isValid, true)
      assert.strictEqual(validateCaseNumber('   ').isValid, true)
      assert.strictEqual(validateCaseNumber(undefined).isValid, true)
    })

    it('allows internal auto-generated IDs', () => {
      assert.strictEqual(validateCaseNumber('CASE_b2vpiq_mvh7mwvj').isValid, true)
      assert.strictEqual(validateCaseNumber('case_9999').isValid, true)
    })

    it('validates standard 16-digit spaced format', () => {
      const res = validateCaseNumber('1792 1487 9533 6269')
      assert.strictEqual(res.isValid, true)
      assert.strictEqual(res.digitsCount, 16)
    })

    it('validates continuous 16-digit string', () => {
      const res = validateCaseNumber('1792148795336269')
      assert.strictEqual(res.isValid, true)
      assert.strictEqual(res.digitsCount, 16)
    })

    it('validates hyphen-separated 16-digit string', () => {
      const res = validateCaseNumber('1792-1487-9533-6269')
      assert.strictEqual(res.isValid, true)
      assert.strictEqual(res.digitsCount, 16)
    })

    it('fails if non-digits (like letters) are entered', () => {
      const res = validateCaseNumber('FC-23-001234')
      assert.strictEqual(res.isValid, false)
      assert.ok(res.error?.includes('numbers'))
    })

    it('fails if fewer than 16 digits are entered', () => {
      const res = validateCaseNumber('1792 1487')
      assert.strictEqual(res.isValid, false)
      assert.strictEqual(res.digitsCount, 8)
      assert.ok(res.error?.includes('8/16 digits'))
    })
  })
})
