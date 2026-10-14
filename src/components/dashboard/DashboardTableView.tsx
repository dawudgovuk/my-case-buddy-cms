import { Table, Button } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import { getStagesForCase, getCurrentStageIndex } from '../../utils/caseStages'
import {
  FaFolderOpen,
  FaEdit,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaChild,
  FaGavel,
  FaHandshake,
} from 'react-icons/fa'

export interface DashboardTableViewProps {
  cases: FamilyCase[]
  onViewCase: (caseId: string) => void
  onEditCase?: (caseId: string) => void
  onTogglePeerSupport: (caseId: string, currentStatus: boolean) => void
}

export default function DashboardTableView({
  cases,
  onViewCase,
  onEditCase,
  onTogglePeerSupport,
}: DashboardTableViewProps) {
  if (cases.length === 0) {
    return (
      <div className="premium-card p-5 text-center text-muted">
        No cases match your filters.
      </div>
    )
  }

  return (
    <div className="premium-card overflow-hidden border-0 shadow-sm">
      <div className="table-responsive">
        <Table hover className="align-middle mb-0 custom-dashboard-table">
          <thead className="bg-light border-bottom text-uppercase text-secondary" style={{ fontSize: '0.74rem', letterSpacing: '0.5px' }}>
            <tr>
              <th className="py-3 px-3">Case Reference & Title</th>
              <th className="py-3 px-3">Type & Court</th>
              <th className="py-3 px-3" style={{ minWidth: 170 }}>Stage Progress</th>
              <th className="py-3 px-3" style={{ minWidth: 180 }}>Next Hearing</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Peer Support</th>
              <th className="py-3 px-3 text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => {
              const stages = getStagesForCase(c)
              const currentStageIndex = getCurrentStageIndex(c)
              const progressPercent = Math.min(
                100,
                Math.round(((currentStageIndex + 1) / Math.max(stages.length, 1)) * 100)
              )
              const nextHearing = c.hearings && c.hearings.length > 0 ? c.hearings[0] : null
              const isSeeking = Boolean(c.seekingPeerSupport)
              const partiesCount = c.parties?.filter(p => p.role !== 'Child').length || 0
              const childrenCount = c.parties?.filter(p => p.role === 'Child').length || 0

              const statusBadgeClass =
                c.status === 'Open'
                  ? 'badge-soft-emerald'
                  : c.status === 'Stayed'
                    ? 'badge-soft-amber'
                    : 'badge-soft-slate'

              return (
                <tr key={c.id} className="transition-all">
                  {/* Case Ref & Title */}
                  <td className="py-3 px-3">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-light text-muted border font-monospace px-1.5 py-0.5 small">
                        {c.id}
                      </span>
                      <div className="d-flex align-items-center gap-1.5 text-muted small">
                        <span title={`${partiesCount} Parties`} className="d-inline-flex align-items-center gap-1">
                          <FaUsers size={11} className="text-secondary opacity-75" />
                          <span>{partiesCount}</span>
                        </span>
                        {childrenCount > 0 && (
                          <span title={`${childrenCount} Children`} className="d-inline-flex align-items-center gap-1 ms-1">
                            <FaChild size={10} className="text-secondary opacity-75" />
                            <span>{childrenCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="fw-bold text-dark text-truncate cursor-pointer hover-text-primary"
                      style={{ maxWidth: 260, fontSize: '0.92rem' }}
                      onClick={() => onViewCase(c.id)}
                      title={c.title}
                    >
                      {c.title}
                    </div>
                  </td>

                  {/* Type & Court */}
                  <td className="py-3 px-3">
                    <div className="text-dark small fw-medium text-truncate" style={{ maxWidth: 200 }}>
                      {c.caseType}
                    </div>
                    <div className="text-muted small d-flex align-items-center gap-1 text-truncate" style={{ maxWidth: 200 }}>
                      <FaGavel size={10} className="text-secondary flex-shrink-0" />
                      <span>{c.court}</span>
                    </div>
                  </td>

                  {/* Stage Progress */}
                  <td className="py-3 px-3">
                    <div className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="text-truncate text-secondary" style={{ fontSize: '0.75rem', maxWidth: 130 }}>
                        {stages[currentStageIndex]?.name || 'In Progress'}
                      </span>
                      <span className="fw-semibold text-muted" style={{ fontSize: '0.72rem' }}>
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="case-mini-progress" style={{ width: '100%', height: 5 }}>
                      <div
                        className="case-mini-progress-bar"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Stage {currentStageIndex + 1} of {stages.length}
                    </div>
                  </td>

                  {/* Next Hearing */}
                  <td className="py-3 px-3">
                    {nextHearing ? (
                      <div className="p-2 rounded-2 bg-light border-start border-3 border-warning small">
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 170 }}>
                          {nextHearing.type}
                        </div>
                        <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '0.76rem' }}>
                          <span className="d-inline-flex align-items-center gap-1">
                            <FaCalendarAlt size={10} className="text-muted" />
                            <span>{nextHearing.date}</span>
                          </span>
                          {nextHearing.time && (
                            <span className="d-inline-flex align-items-center gap-1">
                              <FaClock size={10} className="text-muted" />
                              <span>{nextHearing.time}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted small font-italic">
                        No upcoming hearing
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <span className={`badge rounded-pill px-2.5 py-1 small fw-semibold ${statusBadgeClass}`}>
                      ● {c.status}
                    </span>
                  </td>

                  {/* Peer Support */}
                  <td className="py-3 px-3 text-center">
                    <Button
                      variant={isSeeking ? 'success' : 'light'}
                      className={`btn-sm py-1 px-2.5 border rounded-pill d-inline-flex align-items-center gap-1 ${
                        isSeeking ? 'bg-success text-white' : 'btn-soft text-secondary'
                      }`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => onTogglePeerSupport(c.id, isSeeking)}
                      title={isSeeking ? 'Peer Support is active (Click to toggle)' : 'Request peer review assistance'}
                    >
                      <FaHandshake size={11} />
                      <span>{isSeeking ? 'Active' : 'Enable'}</span>
                    </Button>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-end">
                    <div className="d-inline-flex align-items-center gap-1.5">
                      <Button
                        className="btn-obsidian btn-sm py-1.5 px-3 d-inline-flex align-items-center gap-1.5 shadow-none"
                        onClick={() => onViewCase(c.id)}
                        style={{ fontSize: '0.8rem' }}
                      >
                        <FaFolderOpen size={11} />
                        <span>Open</span>
                      </Button>
                      {onEditCase && (
                        <Button
                          variant="light"
                          className="btn-soft text-secondary btn-sm py-1.5 px-2 border"
                          onClick={() => onEditCase(c.id)}
                          title="Edit Case"
                          aria-label="Edit Case"
                        >
                          <FaEdit size={11} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    </div>
  )
}
