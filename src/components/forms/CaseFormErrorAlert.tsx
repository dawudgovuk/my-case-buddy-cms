import { Alert } from 'react-bootstrap'
import { FaExclamationTriangle } from 'react-icons/fa'

export interface CaseFormErrorAlertProps {
  message: string
  onDismiss: () => void
}

/**
 * Dismissible danger alert surfacing a failed case save action.
 */
export default function CaseFormErrorAlert({ message, onDismiss }: CaseFormErrorAlertProps) {
  return (
    <Alert
      variant="danger"
      dismissible
      onClose={onDismiss}
      className="d-flex align-items-center gap-2 mb-3 shadow-sm rounded-3"
    >
      <FaExclamationTriangle className="text-danger flex-shrink-0" />
      <div className="small">
        <strong>Action failed:</strong> {message}
      </div>
    </Alert>
  )
}
