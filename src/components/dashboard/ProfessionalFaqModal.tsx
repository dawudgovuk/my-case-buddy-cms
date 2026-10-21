import { Modal, Button, Accordion, Badge } from 'react-bootstrap'
import {
  FaQuestionCircle,
  FaUserFriends,
  FaBalanceScale,
  FaShieldAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaLifeRing,
  FaExternalLinkAlt,
} from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

export interface ProfessionalFaqModalProps {
  show: boolean
  onHide: () => void
}

export default function ProfessionalFaqModal({ show, onHide }: ProfessionalFaqModalProps) {
  const { t } = useTranslation()

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom pb-3">
        <Modal.Title className="d-flex align-items-center gap-2 text-primary fs-5">
          <FaQuestionCircle />
          <span>{t('professional.faqSystemGuideTitle')}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="text-secondary small mb-4">
          {t('professional.faqIntro')}
        </p>

        <Accordion defaultActiveKey="0" flush className="faq-accordion">
          <Accordion.Item eventKey="0" className="border rounded-3 mb-2 overflow-hidden">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2">
                <FaUserFriends className="text-primary" />
                <span className="fw-semibold">{t('professional.whatIsMckenzieFriend')}</span>
              </div>
            </Accordion.Header>
            <Accordion.Body className="text-secondary small">
              <p className="mb-2">
                A <strong>McKenzie Friend</strong> is someone who accompanies a Litigant in Person (self-representing
                individual) to a UK family court hearing.
              </p>
              <ul className="mb-0 ps-3">
                <li>Provide moral support and reassurance.</li>
                <li>Take notes during court proceedings and hearings.</li>
                <li>Help organise case papers, evidence bundles, and statements.</li>
                <li>Give quiet advice on questions to ask or legal points.</li>
              </ul>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className="border rounded-3 mb-2 overflow-hidden">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2">
                <FaBalanceScale className="text-primary" />
                <span className="fw-semibold">{t('professional.whatIsLip')}</span>
              </div>
            </Accordion.Header>
            <Accordion.Body className="text-secondary small">
              A <strong>Litigant in Person</strong> is an individual who is not represented by a solicitor or barrister
              and handles their own family court case. My Case Buddy provides them with a structured CMS to track their
              orders, hearings, and evidence, and connect with experienced supporters.
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2" className="border rounded-3 mb-2 overflow-hidden">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2">
                <FaShieldAlt className="text-warning" />
                <span className="fw-semibold">{t('professional.whyVerificationRequired')}</span>
              </div>
            </Accordion.Header>
            <Accordion.Body className="text-secondary small">
              <p className="mb-2">
                UK Family Court matters (especially child arrangements and care proceedings) are private and governed
                by <strong>Family Procedure Rules (FPR Part 12)</strong> and strict UK GDPR safeguarding principles.
              </p>
              <p className="mb-0">
                To prevent unauthorised access to confidential cases, professionals and McKenzie Friends must verify
                their email address before viewing requests posted by community members seeking peer assistance.
              </p>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="3" className="border rounded-3 mb-2 overflow-hidden">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2">
                <FaCheckCircle className="text-success" />
                <span className="fw-semibold">{t('professional.diffAssignedPeer')}</span>
              </div>
            </Accordion.Header>
            <Accordion.Body className="text-secondary small">
              <div className="mb-2">
                <Badge bg="primary" className="me-2">{t('professional.assignedCasesTitle')}</Badge>
                Private cases where a litigant has directly added you as a case collaborator or legal representative.
                You can access and work on these at any time.
              </div>
              <div>
                <Badge bg="info" className="me-2">{t('dashboard.peerRequest')}</Badge>
                Community requests posted by litigants who are seeking experienced help or document review. Access is
                unlocked once your email verification is complete.
              </div>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="4" className="border rounded-3 mb-0 overflow-hidden">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2">
                <FaCalendarAlt className="text-info" />
                <span className="fw-semibold">{t('professional.whatAreHearingsDeadlines')}</span>
              </div>
            </Accordion.Header>
            <Accordion.Body className="text-secondary small">
              Family courts follow strict procedural timelines (such as the First Hearing Dispute Resolution Appointment —
              FHDRA, Dispute Resolution Appointment — DRA, or Final Hearing). The Hearings & Deadlines tab keeps track of
              all upcoming court dates and evidence submission due dates across your cases.
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="5" className="border rounded-3 mb-0 overflow-hidden">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2">
                <FaLifeRing className="text-primary" />
                <span className="fw-semibold">{t('professional.whereFindGuidance')}</span>
              </div>
            </Accordion.Header>
            <Accordion.Body className="text-secondary small">
              <p className="mb-2">
                For in-depth legal articles, procedural guidance, and practical toolkits, visit our official Knowledge Base:
              </p>
              <ul className="mb-3 ps-3">
                <li><strong>Children Case Law:</strong> Summary of key family court precedents and welfare principles.</li>
                <li><strong>Grounds for Appeal:</strong> Procedural requirements and threshold criteria for family orders.</li>
                <li><strong>Alienating Behaviours:</strong> The three necessary elements recognized in family proceedings.</li>
                <li><strong>Video Calls with Children:</strong> Practical hints and tips for remote contact and evidence.</li>
              </ul>
              <a
                href="https://support.mycourtbuddy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 fw-semibold"
              >
                <FaLifeRing size={12} />
                <span>{t('professional.visitSupportCentre')}</span>
                <FaExternalLinkAlt size={10} className="text-muted" />
              </a>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Modal.Body>
      <Modal.Footer className="border-top pt-3 d-flex justify-content-between align-items-center">
        <a
          href="https://support.mycourtbuddy.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 rounded-pill px-3 shadow-xs"
        >
          <FaLifeRing size={12} className="text-primary" />
          <span>{t('professional.knowledgeBaseArticles')}</span>
          <FaExternalLinkAlt size={10} className="text-muted" />
        </a>
        <Button variant="primary" onClick={onHide} className="px-4">
          {t('professional.understoodClose')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
