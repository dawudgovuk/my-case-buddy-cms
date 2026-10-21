import { useState, useEffect } from 'react'
import { Card, Form, Row, Col, Button, Badge, Collapse } from 'react-bootstrap'
import { useCasesStore } from '../../../store/casesStore'
import { useTranslation } from '../../../hooks/useTranslation'
import { generateId } from '../../../services/storage'
import { toast } from '../../../store/toastStore'
import type { FamilyCase, Hearing, RemotePlatform, HearingOutcome } from '../../../types/domain'
import HearingCard from '../HearingCard'
import { FaCalendarPlus, FaVideo, FaShieldAlt, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa'

export interface HearingsTabProps {
  caseId: string
}

export default function HearingsTab({ caseId }: HearingsTabProps) {
  const store = useCasesStore()
  const { t } = useTranslation()
  const [type, setType] = useState<Hearing['type']>('Case Management')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState<string>('10:00')
  const [location, setLocation] = useState<string>('')
  const [judge, setJudge] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [remotePlatform, setRemotePlatform] = useState<RemotePlatform>('In-Person')
  const [remoteLink, setRemoteLink] = useState<string>('')
  const [specialMeasures, setSpecialMeasures] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [courtNames, setCourtNames] = useState<string[]>([])

  useEffect(() => {
    import('../../../utils/courtLocations').then((mod) => {
      mod.getCourtNames().then((names) => setCourtNames(names))
    })
  }, [])

  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase

  const isRemote = remotePlatform !== 'In-Person'

  function addHearing() {
    if (!date) return
    const newHearing: Hearing = {
      id: generateId('HRG'),
      type,
      date,
      time: time || undefined,
      location: location || undefined,
      judge: judge || undefined,
      notes: notes.trim() || undefined,
      outcome: 'Pending' as HearingOutcome,
      remotePlatform,
      remoteLink: isRemote ? remoteLink.trim() || undefined : undefined,
      specialMeasures: specialMeasures.trim() || undefined,
    }

    const updated: FamilyCase = {
      ...current,
      hearings: [...(current.hearings || []), newHearing],
    }

    store.addOrUpdate(updated)
    toast.success(`Scheduled ${type} hearing on ${date}.`, 'Hearing Scheduled')

    // Reset form
    setLocation('')
    setJudge('')
    setNotes('')
    setRemoteLink('')
    setSpecialMeasures('')
    setRemotePlatform('In-Person')
  }

  // Filter hearings
  const todayStr = new Date().toISOString().slice(0, 10)
  const filteredHearings = (current.hearings || []).filter((h) => {
    if (filterType === 'UPCOMING') return h.date >= todayStr
    if (filterType === 'PAST') return h.date < todayStr
    if (filterType === 'ORDER_MADE') return h.outcome === 'Order Made'
    return true
  })

  const upcomingCount = (current.hearings || []).filter((h) => h.date >= todayStr).length
  const pastCount = (current.hearings || []).filter((h) => h.date < todayStr).length

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Stats Banner */}
      <Card className="border shadow-sm bg-white p-3 rounded-3">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <div>
            <h6 className="fw-bold mb-1 text-dark">{t.caseTabs.hearingsTitle}</h6>
            <div className="small text-muted">
              {t.caseTabs.hearingsSubtitle}
            </div>
          </div>
          <div className="d-flex gap-2">
            <Badge bg="primary" className="py-1 px-2 font-monospace">
              {upcomingCount} {t.caseTabs.filterUpcomingListings}
            </Badge>
            <Badge bg="secondary" className="py-1 px-2 font-monospace">
              {pastCount} {t.common.concluded}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Schedule Hearing Form */}
      <Card className="p-3 shadow-sm border bg-white rounded-3">
        <Card.Title className="h6 fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
          <FaCalendarPlus className="text-primary" />
          <span>{t.caseTabs.scheduleNewListing}</span>
        </Card.Title>

        <Form as={Row} className="g-2 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.hearingType}</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value as Hearing['type'])} size="sm">
                {['Case Management', 'Directions', 'Fact-Finding', 'Final', 'Other'].map((tVal) => (
                  <option key={tVal} value={tVal}>
                    {tVal}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.hearingDate}</Form.Label>
              <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} size="sm" />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.hearingTime}</Form.Label>
              <Form.Control type="time" value={time} onChange={(e) => setTime(e.target.value)} size="sm" />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.hearingLocation}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                list="court-locations-datalist"
                placeholder="Type or select venue"
                autoComplete="off"
              />
              <datalist id="court-locations-datalist">
                {courtNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.hearingJudge}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={judge}
                onChange={(e) => setJudge(e.target.value)}
                placeholder="e.g. HHJ Jenkins / Legal Adviser"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">{t.caseTabs.hearingPlatform}</Form.Label>
              <Form.Select
                size="sm"
                value={remotePlatform}
                onChange={(e) => setRemotePlatform(e.target.value as RemotePlatform)}
              >
                {['In-Person', 'CVP (Cloud Video Platform)', 'MS Teams', 'BT MeetMe', 'Telephone'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4} className="text-end">
            <Button variant="primary" size="sm" onClick={addHearing} disabled={!date} className="w-100 fw-semibold">
              + {t.caseTabs.scheduleHearing}
            </Button>
          </Col>

          {/* Toggle Advanced / Special Measures Options */}
          <Col xs={12} className="mt-1">
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none small text-secondary d-inline-flex align-items-center gap-1"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
              <span>{showAdvanced ? t.caseTabs.hideLogistics : t.caseTabs.showLogistics}</span>
            </Button>
          </Col>

          <Col xs={12}>
            <Collapse in={showAdvanced}>
              <Row className="g-2 pt-2 border-top mt-1">
                {isRemote && (
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold d-flex align-items-center gap-1">
                        <FaVideo size={11} className="text-primary" />
                        <span>{t.caseTabs.hearingRemoteLink}</span>
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={remoteLink}
                        onChange={(e) => setRemoteLink(e.target.value)}
                        placeholder="https://cvp.justice.gov.uk/room/..."
                      />
                    </Form.Group>
                  </Col>
                )}

                <Col md={isRemote ? 6 : 12}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold d-flex align-items-center gap-1">
                      <FaShieldAlt size={11} className="text-danger" />
                      <span>{t.caseTabs.hearingSpecialMeasures}</span>
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      value={specialMeasures}
                      onChange={(e) => setSpecialMeasures(e.target.value)}
                      placeholder="e.g. Separate entrance and waiting room, witness screens"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold">{t.caseTabs.prepNotes}</Form.Label>
                    <Form.Control
                      size="sm"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Position statements to be exchanged 2 days before"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Collapse>
          </Col>
        </Form>
      </Card>

      {/* Filter Bar */}
      <div className="d-flex justify-content-between align-items-center gap-2">
        <div className="small text-muted fw-semibold">
          {t.caseTabs.hearingsTitle} ({filteredHearings.length})
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted d-flex align-items-center gap-1">
            <FaFilter size={10} />
            <span>{t.common.filter}:</span>
          </span>
          <Form.Select
            size="sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '170px' }}
          >
            <option value="ALL">{t.caseTabs.filterAllHearings}</option>
            <option value="UPCOMING">{t.caseTabs.filterUpcomingListings}</option>
            <option value="PAST">{t.caseTabs.filterPastHearings}</option>
            <option value="ORDER_MADE">{t.caseTabs.filterOrderMade}</option>
          </Form.Select>
        </div>
      </div>

      {/* Hearings List */}
      {filteredHearings.length === 0 ? (
        <div className="text-muted p-4 bg-light rounded text-center border">
          {t.caseTabs.noHearingsFound}
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filteredHearings.map((h) => (
            <HearingCard
              key={h.id}
              hearing={h}
              courtLocations={courtNames}
              onSave={(updatedHearing) => {
                const updated: FamilyCase = {
                  ...current,
                  hearings: current.hearings.map((orig) => (orig.id === h.id ? updatedHearing : orig)),
                }
                store.addOrUpdate(updated)
                toast.success(`Hearing listing updated.`, 'Hearing Updated')
              }}
              onDelete={() => {
                const updated: FamilyCase = {
                  ...current,
                  hearings: current.hearings.filter((orig) => orig.id !== h.id),
                }
                store.addOrUpdate(updated)
                toast.info(`Hearing listing removed.`, 'Hearing Removed')
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
