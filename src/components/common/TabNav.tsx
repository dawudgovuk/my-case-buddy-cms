import type { ReactNode } from 'react'
import { Nav, Badge } from 'react-bootstrap'

export interface TabItem<T extends string = string> {
  key: T
  label: string
  count?: number
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark'
  icon?: ReactNode
}

export interface TabNavProps<T extends string = string> {
  items: TabItem<T>[]
  activeKey: T
  onSelect: (key: T) => void
  variant?: 'tabs' | 'pills' | 'underline'
  className?: string
}

export default function TabNav<T extends string = string>({
  items,
  activeKey,
  onSelect,
  variant = 'tabs',
  className = 'mb-4',
}: TabNavProps<T>) {
  return (
    <Nav
      variant={variant}
      className={`nav-tabs-responsive ${className}`}
      activeKey={activeKey}
      onSelect={(k) => {
        if (k) onSelect(k as T)
      }}
    >
      {items.map((tab) => {
        const isActive = activeKey === tab.key
        return (
          <Nav.Item key={tab.key}>
            <Nav.Link
              eventKey={tab.key}
              active={isActive}
              className="fw-semibold d-flex align-items-center gap-2"
              role="tab"
              aria-selected={isActive}
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <Badge bg={tab.badgeVariant || (isActive ? 'primary' : 'secondary')} pill>
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
