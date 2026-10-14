import { InputGroup, Form, ListGroup, Badge } from 'react-bootstrap'
import {
  FaSearch,
  FaMousePointer,
  FaFolderOpen,
  FaCompass,
  FaPuzzlePiece,
  FaLayerGroup,
  FaFileContract,
  FaListUl,
  FaShieldAlt,
  FaEdit,
} from 'react-icons/fa'
import type { ComponentItem, ComponentCategory } from './types'

export interface ComponentSidebarProps {
  components: ComponentItem[]
  activeId: string
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectComponent: (id: string) => void
}

const CATEGORY_ICONS: Record<ComponentCategory, React.ReactNode> = {
  'Cases & Progression': <FaFolderOpen className="text-success me-2" />,
  'Case Management & Records': <FaFileContract className="text-primary me-2" />,
  'Form Inputs & Controls': <FaEdit className="text-info me-2" />,
  'Case Lists & Badges': <FaListUl className="text-secondary me-2" />,
  'Legal Directory & Safeguarding': <FaShieldAlt className="text-danger me-2" />,
  'Buttons & Actions': <FaMousePointer className="text-primary me-2" />,
  'Navigation & Brand': <FaCompass className="text-dark me-2" />,
  'Dashboard Widgets': <FaPuzzlePiece className="text-warning me-2" />,
}

export function ComponentSidebar({
  components,
  activeId,
  searchQuery,
  onSearchChange,
  onSelectComponent,
}: ComponentSidebarProps) {
  const categories: ComponentCategory[] = [
    'Cases & Progression',
    'Case Management & Records',
    'Form Inputs & Controls',
    'Case Lists & Badges',
    'Legal Directory & Safeguarding',
    'Buttons & Actions',
    'Navigation & Brand',
    'Dashboard Widgets',
  ]

  const filteredComponents = components.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
  })

  return (
    <div className="bg-white rounded border p-3 h-100 shadow-sm">
      <div className="mb-3">
        <label htmlFor="component-search-input" className="form-label small fw-bold text-secondary text-uppercase mb-1">
          Find Component
        </label>
        <InputGroup size="sm">
          <InputGroup.Text className="bg-light">
            <FaSearch className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            id="component-search-input"
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => onSearchChange('')}
            >
              ×
            </button>
          )}
        </InputGroup>
      </div>

      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {/* Show All Option */}
        <ListGroup.Item
          action
          active={activeId === 'all'}
          onClick={() => onSelectComponent('all')}
          className={`rounded px-3 py-2 small fw-bold mb-3 border d-flex align-items-center justify-content-between ${
            activeId === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-light text-dark'
          }`}
          style={{ cursor: 'pointer' }}
        >
          <span className="d-flex align-items-center gap-2">
            <FaLayerGroup />
            <span>Show All Components</span>
          </span>
          <Badge bg={activeId === 'all' ? 'light' : 'primary'} text={activeId === 'all' ? 'dark' : 'white'} pill>
            {components.length}
          </Badge>
        </ListGroup.Item>

        {categories.map((category) => {
          const itemsInCat = filteredComponents.filter((c) => c.category === category)
          if (itemsInCat.length === 0) return null

          return (
            <div key={category} className="mb-3">
              <div className="d-flex align-items-center justify-content-between text-secondary small fw-bold px-2 py-1 mb-1">
                <span className="d-flex align-items-center">
                  {CATEGORY_ICONS[category]}
                  <span>{category}</span>
                </span>
                <Badge bg="light" text="dark" pill className="border">
                  {itemsInCat.length}
                </Badge>
              </div>

              <ListGroup variant="flush">
                {itemsInCat.map((item) => {
                  const isActive = item.id === activeId
                  return (
                    <ListGroup.Item
                      key={item.id}
                      action
                      active={isActive}
                      onClick={() => onSelectComponent(item.id)}
                      className={`rounded px-3 py-2 small fw-medium mb-1 border-0 ${
                        isActive ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.name}
                    </ListGroup.Item>
                  )
                })}
              </ListGroup>
            </div>
          )
        })}

        {filteredComponents.length === 0 && (
          <div className="text-center py-4 text-muted small">
            No components match &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  )
}

export default ComponentSidebar
