import { useEffect, useState, useRef, useCallback } from 'react'
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from 'react-icons/fa'
import { Spinner } from 'react-bootstrap'
import { useToastStore } from '../../store/toastStore'
import type { ToastItem, ToastType } from '../../types/toast'

interface ToastItemProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

function getToastIcon(type: ToastType) {
  switch (type) {
    case 'success':
      return <FaCheckCircle className="mcb-toast-icon-svg text-success" />
    case 'error':
      return <FaTimesCircle className="mcb-toast-icon-svg text-danger" />
    case 'warning':
      return <FaExclamationTriangle className="mcb-toast-icon-svg text-warning" />
    case 'loading':
      return <Spinner animation="border" size="sm" className="text-primary" />
    case 'info':
    default:
      return <FaInfoCircle className="mcb-toast-icon-svg text-primary" />
  }
}

function ToastItemCard({ toast, onDismiss }: ToastItemProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const remainingTimeRef = useRef<number>(toast.duration || 0)
  const lastTickRef = useRef<number>(Date.now())
  const timerRef = useRef<number | null>(null)

  const handleDismiss = useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 220)
  }, [onDismiss, toast.id])

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return

    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    lastTickRef.current = Date.now()
    timerRef.current = window.setTimeout(() => {
      handleDismiss()
    }, remainingTimeRef.current)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      const elapsed = Date.now() - lastTickRef.current
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
    }
  }, [isPaused, toast.duration, handleDismiss])

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`mcb-toast-item mcb-toast-${toast.type} ${isLeaving ? 'mcb-toast-leaving' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id={toast.id}
    >
      <div className="mcb-toast-body d-flex align-items-start gap-3 p-3">
        <div className={`mcb-toast-icon-box mcb-toast-icon-${toast.type} flex-shrink-0 mt-0.5`}>
          {getToastIcon(toast.type)}
        </div>

        <div className="mcb-toast-content flex-grow-1 min-width-0">
          {toast.title && <div className="mcb-toast-title fw-bold text-dark mb-0.5">{toast.title}</div>}
          <div className="mcb-toast-message small text-secondary">{toast.message}</div>

          {toast.action && (
            <button
              type="button"
              className="btn btn-sm btn-link p-0 text-primary fw-semibold mt-1.5 text-decoration-none"
              onClick={() => {
                toast.action?.onClick()
                handleDismiss()
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {toast.dismissible && (
          <button
            type="button"
            className="mcb-toast-close-btn btn btn-link p-1 text-muted flex-shrink-0"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <FaTimes size={13} />
          </button>
        )}
      </div>

      {toast.duration && toast.duration > 0 && (
        <div
          className={`mcb-toast-progress-bar mcb-toast-progress-${toast.type}`}
          style={{
            animationDuration: `${toast.duration}ms`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      )}
    </div>
  )
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="mcb-toast-container" aria-label="Notifications" role="region">
      {toasts.map((t) => (
        <ToastItemCard key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
