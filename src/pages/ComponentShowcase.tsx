import { useState } from 'react'
import { Container, Row, Col, Alert, Toast, ToastContainer, Button, ButtonGroup, Badge } from 'react-bootstrap'
import { COMPONENT_CATALOG } from '../components/showcase/componentRegistry'
import ComponentSidebar from '../components/showcase/ComponentSidebar'
import ComponentStage from '../components/showcase/ComponentStage'
import { FaInfoCircle, FaLayerGroup, FaEye } from 'react-icons/fa'

export default function ComponentShowcase() {
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all')
  const [activeComponentId, setActiveComponentId] = useState<string>('case-card-timeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [eventToast, setEventToast] = useState<string | null>(null)

  const handleFeedback = (message: string) => {
    setEventToast(message)
  }

  const handleSelectComponent = (id: string) => {
    if (id === 'all') {
      setViewMode('all')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setActiveComponentId(id)

    if (viewMode === 'all') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const filteredComponents = COMPONENT_CATALOG.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
  })

  const singleActiveComponent =
    COMPONENT_CATALOG.find((c) => c.id === activeComponentId) ?? COMPONENT_CATALOG[0]

  return (
    <Container fluid className="py-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="h3 mb-0 fw-bold text-dark">Component Explorer</h1>
            <Badge bg="primary" pill>
              {COMPONENT_CATALOG.length} Components
            </Badge>
          </div>
          <p className="text-secondary small mb-0">
            Preview, test, and copy code for all UI components — including the Case Card Timeline, Standalone Timeline, Steppers, and Actions.
          </p>
        </div>

        {/* View Mode Toggle */}
        <ButtonGroup size="sm">
          <Button
            variant={viewMode === 'all' ? 'primary' : 'outline-primary'}
            className="d-flex align-items-center gap-1"
            onClick={() => setViewMode('all')}
          >
            <FaLayerGroup />
            <span>Show All Components</span>
          </Button>
          <Button
            variant={viewMode === 'single' ? 'primary' : 'outline-primary'}
            className="d-flex align-items-center gap-1"
            onClick={() => setViewMode('single')}
          >
            <FaEye />
            <span>Single Focus</span>
          </Button>
        </ButtonGroup>
      </div>

      <Row className="g-3 align-items-start">
        {/* Left Column: Quick Navigation Sidebar */}
        <Col xs={12} lg={4} xl={3} className="position-lg-sticky top-0">
          <ComponentSidebar
            components={COMPONENT_CATALOG}
            activeId={viewMode === 'all' ? 'all' : activeComponentId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectComponent={handleSelectComponent}
          />
        </Col>

        {/* Right Column: Components Flow or Single Stage */}
        <Col xs={12} lg={8} xl={9}>
          {viewMode === 'all' ? (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded border small">
                <span className="text-secondary fw-semibold">
                  Displaying {filteredComponents.length} of {COMPONENT_CATALOG.length} components. Click any item on the left to jump directly to it.
                </span>
                <span className="text-muted">Scroll down to view all</span>
              </div>

              {filteredComponents.map((component) => (
                <ComponentStage
                  key={component.id}
                  item={component}
                  onFeedback={handleFeedback}
                />
              ))}

              {filteredComponents.length === 0 && (
                <Alert variant="warning" className="text-center py-4">
                  No components found matching &quot;{searchQuery}&quot;.
                </Alert>
              )}
            </div>
          ) : (
            <div>
              {singleActiveComponent ? (
                <ComponentStage item={singleActiveComponent} onFeedback={handleFeedback} />
              ) : (
                <Alert variant="warning">No component found matching your criteria.</Alert>
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* Floating Action Feedback Toast */}
      <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 1050 }}>
        {eventToast && (
          <Toast
            onClose={() => setEventToast(null)}
            show={Boolean(eventToast)}
            delay={3500}
            autohide
            className="shadow-sm border-0 bg-dark text-white"
          >
            <Toast.Body className="d-flex align-items-center gap-2 py-2 px-3 small">
              <FaInfoCircle className="text-info flex-shrink-0" />
              <span>{eventToast}</span>
            </Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </Container>
  )
}
