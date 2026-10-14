import { create } from 'zustand'
import { DEFAULT_LANGUAGE, type SupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n'

const STORAGE_KEY = 'mcb_language'

interface LanguageState {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
}

function getInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved as SupportedLanguage
    }
  } catch {
    // ignore localStorage read errors
  }
  return DEFAULT_LANGUAGE
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language: SupportedLanguage) => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore localStorage write errors
    }
    set({ language })
  },
}))
