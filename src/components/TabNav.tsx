import type { ReactNode } from 'react'
import { Nav, Badge } from 'react-bootstrap'

export interface TabItem<T extends string = string> {
  key: T
  label: string
  count?: number
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  badgePill?: boolean
  icon?: ReactNode
  disabled?: boolean
  className?: string
  testId?: string
}

export interface TabNavProps<T extends string = string> {
  items: TabItem<T>[]
  activeKey: T
  onSelect: (key: T) => void
  variant?: 'tabs' | 'pills' | 'underline'
  className?: string
  fill?: boolean
  justify?: boolean
  ariaLabel?: string
}

export function TabNav<T extends string = string>({
  items,
  activeKey,
  onSelect,
  variant = 'tabs',
  className = 'mb-4',
  fill = false,
  justify = false,
  ariaLabel = 'Navigation tabs',
}: TabNavProps<T>) {
  const handleSelect = (selectedKey: string | null) => {
    if (selectedKey !== null) {
      onSelect(selectedKey as T)
    }
  }

  return (
    <Nav
      variant={variant}
      activeKey={activeKey}
      onSelect={handleSelect}
      className={className}
      fill={fill}
      justify={justify}
      aria-label={ariaLabel}
    >
      {items.map((tab) => {
        const hasCount = typeof tab.count === 'number'

        return (
          <Nav.Item key={tab.key}>
            <Nav.Link
              eventKey={tab.key}
              disabled={tab.disabled}
              data-testid={tab.testId}
              className={`fw-semibold d-flex align-items-center gap-2 ${tab.className ?? ''}`.trim()}
            >
              {tab.icon && <span className="d-inline-flex align-items-center">{tab.icon}</span>}
              <span>{tab.label}</span>
              {hasCount && (
                <Badge bg={tab.badgeVariant ?? 'secondary'} pill={tab.badgePill ?? true}>
                  {tab.count}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        )
      })}
    </Nav>
  )
}

export default TabNav
