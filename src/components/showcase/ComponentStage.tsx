import { useState } from 'react'
import { Card, Badge, Button, Table, Nav } from 'react-bootstrap'
import { FaCopy, FaCheck, FaEye, FaCode, FaBook } from 'react-icons/fa'
import type { ComponentItem } from './types'

export interface ComponentStageProps {
  item: ComponentItem
  onFeedback: (message: string) => void
}

export function ComponentStage({ item, onFeedback }: ComponentStageProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'props'>('preview')
  const [canvasBg, setCanvasBg] = useState<'white' | 'gray' | 'dark'>('gray')
  const [copiedImport, setCopiedImport] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyImport = () => {
    navigator.clipboard.writeText(item.importStatement).catch(() => {})
    setCopiedImport(true)
    onFeedback(`Copied import statement to clipboard!`)
    setTimeout(() => setCopiedImport(false), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(item.codeSnippet).catch(() => {})
    setCopiedCode(true)
    onFeedback(`Copied code snippet to clipboard!`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const canvasBackgroundClass =
    canvasBg === 'white'
      ? 'bg-white'
      : canvasBg === 'dark'
      ? 'bg-dark text-white'
      : 'bg-light'

  return (
    <div id={item.id} className="mb-4 d-flex flex-column">
      {/* Component Header */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h3 className="fw-bold mb-0 text-dark">{item.name}</h3>
                <Badge bg="primary-subtle" className="text-primary border border-primary-subtle">
                  {item.category}
                </Badge>
                {item.badges.map((b) => (
                  <Badge key={b} bg="light" text="dark" className="border fw-normal">
                    {b}
                  </Badge>
                ))}
              </div>
              <p className="text-secondary mb-0">{item.description}</p>
            </div>

            <Button
              variant={copiedImport ? 'success' : 'outline-primary'}
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={handleCopyImport}
            >
              {copiedImport ? <FaCheck /> : <FaCopy />}
              <span>{copiedImport ? 'Import Copied!' : 'Copy Import'}</span>
            </Button>
          </div>

          <div className="bg-light p-2 rounded border small font-monospace text-truncate text-secondary">
            {item.importStatement}
          </div>
        </Card.Body>
      </Card>

      {/* Tabs: Preview / Code / Props */}
      <Card className="border-0 shadow-sm flex-grow-1 d-flex flex-column">
        <Card.Header className="bg-white border-bottom p-0 d-flex justify-content-between align-items-center flex-wrap px-3">
          <Nav variant="tabs" className="border-bottom-0" activeKey={activeTab}>
            <Nav.Item>
              <Nav.Link
                eventKey="preview"
                onClick={() => setActiveTab('preview')}
                className="d-flex align-items-center gap-2 fw-semibold py-3"
              >
                <FaEye className="text-primary" />
                <span>Interactive Preview</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="code"
                onClick={() => setActiveTab('code')}
                className="d-flex align-items-center gap-2 fw-semibold py-3"
              >
                <FaCode className="text-success" />
                <span>Usage Code</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="props"
                onClick={() => setActiveTab('props')}
                className="d-flex align-items-center gap-2 fw-semibold py-3"
              >
                <FaBook className="text-info" />
                <span>Props Contract ({item.propsDoc.length})</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === 'preview' && (
            <div className="d-flex align-items-center gap-1 py-2">
              <span className="small text-muted me-1">Canvas:</span>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 ${canvasBg === 'white' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setCanvasBg('white')}
              >
                Light
              </button>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 ${canvasBg === 'gray' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setCanvasBg('gray')}
              >
                Neutral
              </button>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 ${canvasBg === 'dark' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setCanvasBg('dark')}
              >
                Dark
              </button>
            </div>
          )}
        </Card.Header>

        <Card.Body className="p-4 flex-grow-1">
          {activeTab === 'preview' && (
            <div
              className={`p-4 rounded border ${canvasBackgroundClass} d-flex align-items-center justify-content-center min-vh-25`}
              style={{ minHeight: '320px' }}
            >
              <div className="w-100">{item.renderPreview(onFeedback)}</div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="position-relative">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted fw-semibold">Quick Copy Example</span>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={handleCopyCode}
                >
                  {copiedCode ? <FaCheck className="text-success" /> : <FaCopy />}
                  <span>{copiedCode ? 'Copied Snippet!' : 'Copy Snippet'}</span>
                </Button>
              </div>
              <pre className="bg-dark text-light p-3 rounded small overflow-auto mb-0" style={{ maxHeight: '420px' }}>
                <code>{item.codeSnippet}</code>
              </pre>
            </div>
          )}

          {activeTab === 'props' && (
            <div>
              {item.propsDoc.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  This component does not require any custom props.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="small align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Prop</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.propsDoc.map((p) => (
                        <tr key={p.name}>
                          <td>
                            <code className="text-primary fw-semibold">{p.name}</code>
                          </td>
                          <td>
                            <code className="text-dark bg-light px-1 py-0.5 rounded">{p.type}</code>
                          </td>
                          <td>
                            {p.defaultVal ? <code>{p.defaultVal}</code> : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            {p.required ? (
                              <Badge bg="danger">Required</Badge>
                            ) : (
                              <Badge bg="light" text="dark" className="border">
                                Optional
                              </Badge>
                            )}
                          </td>
                          <td className="text-secondary">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default ComponentStage
