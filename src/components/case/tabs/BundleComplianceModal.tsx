import { useState } from 'react'
import { Modal, Button, ProgressBar, Badge, Alert, Table } from 'react-bootstrap'
import { FaCheckCircle, FaExclamationTriangle, FaCopy, FaStickyNote } from 'react-icons/fa'
import type { FamilyCase } from '../../../types/domain'
import {
  PD27A_MAX_PAGES,
  BUNDLE_SECTIONS,
  evaluateBundleCompliance,
  generateBundleIndexText,
} from '../../../utils/bundleCompliance'
import { useCasesStore } from '../../../store/casesStore'
import { generateId } from '../../../services/storage'
import { toast } from '../../../store/toastStore'

export interface BundleComplianceModalProps {
  show: boolean
  onHide: () => void
  caseData: FamilyCase
}

export default function BundleComplianceModal({ show, onHide, caseData }: BundleComplianceModalProps) {
  const store = useCasesStore()
  const [copied, setCopied] = useState(false)
  const summary = evaluateBundleCompliance(caseData.documents || [])

  const percentage = Math.min(100, Math.round((summary.totalPages / PD27A_MAX_PAGES) * 100))
  const progressVariant = summary.isCompliant ? (percentage > 85 ? 'warning' : 'success') : 'danger'

  const handleCopyIndex = async () => {
    const text = generateBundleIndexText(caseData.title, caseData.caseNumber || '', summary)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('PD 27A Bundle Index copied to clipboard.', 'Copied')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Failed to copy to clipboard.', 'Error')
    }
  }

  const handleAppendToNotes = () => {
    const text = generateBundleIndexText(caseData.title, caseData.caseNumber || '', summary)
    const updated: FamilyCase = {
      ...caseData,
      notes: [
        ...(caseData.notes || []),
        {
          id: generateId('NOTE'),
          createdAt: new Date().toISOString(),
          author: 'PD 27A Bundle Auditor',
          text,
        },
      ],
    }
    store.addOrUpdate(updated)
    toast.success('Court Bundle Index appended to Case Strategy Notes.', 'Saved to Notes')
    onHide()
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="h5 fw-bold mb-0 d-flex align-items-center gap-2">
          <span>FPR Practice Direction 27A Bundle Compliance</span>
          {summary.isCompliant ? (
            <Badge bg="success" className="d-flex align-items-center gap-1 font-monospace">
              <FaCheckCircle size={11} />
              <span>Compliant</span>
            </Badge>
          ) : (
            <Badge bg="danger" className="d-flex align-items-center gap-1 font-monospace">
              <FaExclamationTriangle size={11} />
              <span>Exceeds Limit</span>
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Progress & Stat Cards */}
        <div className="bg-light p-3 rounded-3 mb-3 border">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-secondary small">Total Bundle Pagination:</span>
            <span className="fw-bold font-monospace">
              {summary.totalPages} / {PD27A_MAX_PAGES} pages ({percentage}%)
            </span>
          </div>
          <ProgressBar now={percentage} variant={progressVariant} style={{ height: '10px' }} />
          <div className="d-flex justify-content-between text-muted small mt-2">
            <span>
              {summary.isCompliant
                ? `${summary.remainingPages} pages remaining before limit`
                : `${summary.excessPages} pages over statutory limit`}
            </span>
            <span>Documents indexed: {summary.documentCount}</span>
          </div>
        </div>

        {/* Rule Alert */}
        {!summary.isCompliant ? (
          <Alert variant="danger" className="d-flex gap-2 align-items-start small py-2 px-3 mb-3">
            <FaExclamationTriangle className="mt-1 flex-shrink-0" />
            <div>
              <strong>FPR PD 27A Rule Violation:</strong> The bundle exceeds the 350-page maximum limit set by
              Practice Direction 27A para 5.1. Unless express prior permission of the court has been granted, court
              staff may reject this bundle or penalise in costs. Consider pruning duplicate exhibits or applying for
              leave on Form C2.
            </div>
          </Alert>
        ) : (
          <Alert variant="success" className="d-flex gap-2 align-items-center small py-2 px-3 mb-3">
            <FaCheckCircle className="flex-shrink-0" />
            <div>
              <strong>PD 27A Compliant:</strong> The bundle size satisfies the 350-page statutory maximum limit for
              Family Court hearings.
            </div>
          </Alert>
        )}

        {/* Sectioned Table Index */}
        <h6 className="fw-bold mb-2 text-dark">Sectioned Continuous Pagination Index:</h6>
        <div className="border rounded overflow-hidden mb-3">
          <Table responsive hover size="sm" className="mb-0 small align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: '90px' }}>Section</th>
                <th style={{ width: '80px' }}>Exhibit</th>
                <th>Document Title</th>
                <th style={{ width: '80px' }} className="text-center">Pages</th>
                <th style={{ width: '110px' }} className="text-center">Bundle Pages</th>
                <th style={{ width: '85px' }} className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {BUNDLE_SECTIONS.map((sec) => {
                const entries = summary.sections[sec.key] || []
                return (
                  <tr key={sec.key} className="table-secondary fw-semibold">
                    <td colSpan={6} className="py-1 px-2 text-dark">
                      {sec.title}
                      {entries.length === 0 && <span className="fw-normal text-muted ms-2">(None filed)</span>}
                    </td>
                  </tr>
                )
              })}
              {BUNDLE_SECTIONS.flatMap((sec) =>
                (summary.sections[sec.key] || []).map((entry) => (
                  <tr key={entry.document.id}>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        Sec {sec.key}
                      </Badge>
                    </td>
                    <td>
                      {entry.document.exhibitRef ? (
                        <Badge bg="primary" className="font-monospace">
                          {entry.document.exhibitRef}
                        </Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="fw-medium text-dark">{entry.document.title}</td>
                    <td className="text-center font-monospace">{entry.document.pageCount || 1}</td>
                    <td className="text-center font-monospace text-primary fw-bold">
                      {entry.startPage} – {entry.endPage}
                    </td>
                    <td className="text-center">
                      <Badge
                        bg={
                          entry.document.status === 'Served'
                            ? 'success'
                            : entry.document.status === 'Filed'
                            ? 'primary'
                            : 'secondary'
                        }
                      >
                        {entry.document.status || 'Draft'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top d-flex justify-content-between">
        <Button variant="outline-secondary" size="sm" onClick={onHide}>
          Close
        </Button>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={handleAppendToNotes} className="d-flex align-items-center gap-1">
            <FaStickyNote size={12} />
            <span>Append to Case Notes</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleCopyIndex} className="d-flex align-items-center gap-1">
            <FaCopy size={12} />
            <span>{copied ? 'Copied!' : 'Copy Bundle Index'}</span>
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
