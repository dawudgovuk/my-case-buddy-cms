import type { LanguageOption, SupportedLanguage, TranslationSchema } from './types'
import { en } from './locales/en'
import { cy } from './locales/cy'
import { hi } from './locales/hi'
import { bn } from './locales/bn'
import { es } from './locales/es'
import { pl } from './locales/pl'

export { en, cy, hi, bn, es, pl }
export * from './types'

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English (UK)', flag: '🇬🇧' },
  { code: 'cy', label: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pl', label: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
] as const

export const TRANSLATIONS: Record<SupportedLanguage, TranslationSchema> = {
  en,
  cy,
  hi,
  bn,
  es,
  pl,
}

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

export type TranslationKey = NestedKeyOf<TranslationSchema>

/**
 * Resolves a dot-notated translation path (e.g., 'common.dashboard')
 * with optional token interpolation {{key}} and automatic English fallback.
 */
export function translate(
  key: string,
  params?: Record<string, string | number>,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  const currentDict = TRANSLATIONS[language] || en
  const parts = key.split('.')

  let result: unknown = currentDict
  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = (result as Record<string, unknown>)[part]
    } else {
      result = undefined
      break
    }
  }

  // Fallback to English dictionary if key is missing in target language
  if (typeof result !== 'string' && language !== DEFAULT_LANGUAGE) {
    let fallbackResult: unknown = en
    for (const part of parts) {
      if (fallbackResult && typeof fallbackResult === 'object' && part in fallbackResult) {
        fallbackResult = (fallbackResult as Record<string, unknown>)[part]
      } else {
        fallbackResult = undefined
        break
      }
    }
    result = fallbackResult
  }

  if (typeof result !== 'string') {
    return key
  }

  if (!params) {
    return result.replace(/\s*{{\s*\w+\s*}}(?:\s*(?:of|de|z|o)\s*{{\s*\w+\s*}})?/gi, '').trim()
  }

  const substituted = Object.entries(params).reduce((str, [paramKey, paramVal]) => {
    return str.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramVal))
  }, result)

  return substituted.replace(/{{\s*\w+\s*}}/g, '')
}
