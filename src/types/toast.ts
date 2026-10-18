export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  action?: ToastAction
  createdAt: number
  dismissible?: boolean
}

export interface ToastInput {
  type?: ToastType
  title?: string
  message: string
  duration?: number
  action?: ToastAction
  dismissible?: boolean
}
