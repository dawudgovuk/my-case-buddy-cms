import { Nav, Badge } from 'react-bootstrap'
import type { BadgeProps } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'
import type { RegistrationEmailTab } from '../../hooks/useRegistrationPending'

export interface RegistrationEmailTabsProps {
  activeTab: RegistrationEmailTab
  onChange: (tab: RegistrationEmailTab) => void
}

interface TabConfig {
  tab: RegistrationEmailTab
  labelKey: 'auth.confirmationTab' | 'auth.verificationTab'
  badgeLabel: string
  inactiveBg: string
  inactiveText: BadgeProps['text']
}

const TABS: readonly TabConfig[] = [
  { tab: 'confirmation', labelKey: 'auth.confirmationTab', badgeLabel: 'Confirmed', inactiveBg: 'success-subtle', inactiveText: 'success' },
  { tab: 'verification', labelKey: 'auth.verificationTab', badgeLabel: 'Required', inactiveBg: 'warning-subtle', inactiveText: 'warning-emphasis' },
] as const

/**
 * Pill navigator switching between the confirmation and verification email previews.
 */
export default function RegistrationEmailTabs({ activeTab, onChange }: RegistrationEmailTabsProps) {
  const { t } = useTranslation()

  return (
    <Nav variant="pills" className="nav-fill mb-3 bg-light p-1 rounded-3 border">
      {TABS.map(({ tab, labelKey, badgeLabel, inactiveBg, inactiveText }) => {
        const isActive = activeTab === tab
        return (
          <Nav.Item key={tab}>
            <Nav.Link
              active={isActive}
              onClick={() => onChange(tab)}
              className={`py-2 px-3 fw-semibold small d-flex align-items-center justify-content-center gap-1.5 rounded-2 ${
                isActive ? 'bg-primary text-white shadow-xs' : 'text-dark'
              }`}
            >
              <span>{t(labelKey)}</span>
              <Badge bg={isActive ? 'light' : inactiveBg} text={isActive ? 'primary' : inactiveText} className="ms-1">
                {badgeLabel}
              </Badge>
            </Nav.Link>
          </Nav.Item>
        )
      })}
    </Nav>
  )
}
