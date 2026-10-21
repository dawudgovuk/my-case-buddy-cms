import { useMemo } from 'react'
import { useLanguageStore } from '../store/languageStore'
import {
  translate,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  en,
  type SupportedLanguage,
  type LanguageOption,
  type TranslationKey,
  type TranslationSchema,
} from '../i18n'

export type TFunction = ((key: TranslationKey | string, params?: Record<string, string | number>) => string) &
  TranslationSchema

export interface UseTranslationReturn {
  t: TFunction
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  languages: readonly LanguageOption[]
  currentLanguageOption: LanguageOption
}

/**
 * Standard hook for localized string access and language switching.
 * Supports both callable syntax: `t('common.save')`
 * and direct property access: `t.common.save`
 */
export function useTranslation(): UseTranslationReturn {
  const { language, setLanguage } = useLanguageStore()

  const t = useMemo(() => {
    const fn = (key: TranslationKey | string, params?: Record<string, string | number>) => {
      return translate(key, params, language)
    }
    const currentDict = TRANSLATIONS[language] || en
    return Object.assign(fn, currentDict) as TFunction
  }, [language])

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  return {
    t,
    language,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
    currentLanguageOption,
  }
}
