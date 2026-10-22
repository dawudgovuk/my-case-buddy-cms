import { Dropdown } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'
import type { SupportedLanguage } from '../../i18n'
import { FaGlobe, FaCheck } from 'react-icons/fa'
import { toast } from '../../store/toastStore'

export interface LanguageSwitcherProps {
  className?: string
  size?: 'sm' | 'lg'
  variant?: string
  showLabel?: boolean
}

/**
 * Accessible language switcher dropdown supporting English, Welsh, Spanish, and Polish.
 */
export default function LanguageSwitcher({
  className = '',
  size = 'sm',
  variant = 'light',
  showLabel = true,
}: LanguageSwitcherProps) {
  const { t, language, setLanguage, languages, currentLanguageOption } = useTranslation()

  const handleSelectLanguage = (lang: (typeof languages)[number]) => {
    if (lang.code !== language) {
      setLanguage(lang.code as SupportedLanguage)
      toast.info(`Switched interface language to ${lang.label} (${lang.nativeName}).`, 'Language Changed')
    }
  }

  return (
    <Dropdown className={`language-switcher ${className}`}>
      <Dropdown.Toggle
        variant={variant}
        size={size}
        id="language-switcher-dropdown"
        className="d-flex align-items-center gap-1.5 border bg-white py-1 px-2.5 rounded-pill shadow-none text-nowrap"
        style={{ minHeight: 38 }}
        title={t('common.selectLanguage')}
        aria-label={t('common.selectLanguage')}
      >
        <span className="fs-6" role="img" aria-label={currentLanguageOption.label}>
          {currentLanguageOption.flag}
        </span>
        {showLabel && (
          <span className="fw-semibold text-dark small d-inline d-xl-none d-xxl-inline">
            {currentLanguageOption.label}
          </span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="shadow border-0 py-2" style={{ minWidth: 200 }}>
        <div className="px-3 py-1 text-muted small fw-semibold text-uppercase d-flex align-items-center gap-1 border-bottom mb-1">
          <FaGlobe size={12} />
          <span>{t('common.selectLanguage')}</span>
        </div>

        {languages.map((lang) => {
          const isSelected = lang.code === language
          return (
            <Dropdown.Item
              key={lang.code}
              active={isSelected}
              onClick={() => handleSelectLanguage(lang)}
              className="d-flex align-items-center justify-content-between py-2 px-3 small"
            >
              <div className="d-flex align-items-center gap-2">
                <span className="fs-6">{lang.flag}</span>
                <span className={isSelected ? 'fw-bold' : ''}>{lang.nativeName}</span>
              </div>
              {isSelected && <FaCheck size={12} className="text-primary ms-2" />}
            </Dropdown.Item>
          )
        })}
      </Dropdown.Menu>
    </Dropdown>
  )
}
