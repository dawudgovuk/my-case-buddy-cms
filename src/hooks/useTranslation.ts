import { useCallback } from 'react'
import { useLanguageStore } from '../store/languageStore'
import {
  translate,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  type LanguageOption,
  type TranslationKey,
} from '../i18n'

export interface UseTranslationReturn {
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  languages: readonly LanguageOption[]
  currentLanguageOption: LanguageOption
}

/**
 * Standard hook for localized string access and language switching.
 */
export function useTranslation(): UseTranslationReturn {
  const { language, setLanguage } = useLanguageStore()

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>) => {
      return translate(key, params, language)
    },
    [language]
  )

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
