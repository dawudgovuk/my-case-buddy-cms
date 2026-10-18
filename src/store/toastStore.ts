import { create } from 'zustand'
import type { ToastItem, ToastInput } from '../types/toast'

const DEFAULT_DURATION = 4500
const MAX_TOASTS = 5

let toastCounter = 0
function generateToastId(): string {
  toastCounter += 1
  return `toast_${Date.now()}_${toastCounter}`
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (input: ToastInput) => string
  dismissToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (input: ToastInput): string => {
    const id = generateToastId()
    const newToast: ToastItem = {
      id,
      type: input.type ?? 'info',
      title: input.title,
      message: input.message,
      duration: input.duration ?? (input.type === 'loading' ? 0 : DEFAULT_DURATION),
      action: input.action,
      createdAt: Date.now(),
      dismissible: input.dismissible ?? true,
    }

    set((state) => {
      // Keep within MAX_TOASTS by dropping the oldest if limit reached
      const nextToasts = [...state.toasts, newToast]
      if (nextToasts.length > MAX_TOASTS) {
        return { toasts: nextToasts.slice(nextToasts.length - MAX_TOASTS) }
      }
      return { toasts: nextToasts }
    })

    return id
  },

  dismissToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },
}))

/**
 * Imperative helper for triggering toasts anywhere in the app —
 * from React components, event callbacks, Zustand actions, or async services.
 */
export const toast = {
  success: (message: string, title?: string, options?: Partial<ToastInput>): string => {
    return useToastStore.getState().addToast({
      type: 'success',
      title,
      message,
      ...options,
    })
  },

  error: (message: string, title?: string, options?: Partial<ToastInput>): string => {
    return useToastStore.getState().addToast({
      type: 'error',
      title: title || 'Error',
      message,
      duration: options?.duration ?? 6000, // errors stay slightly longer
      ...options,
    })
  },

  warning: (message: string, title?: string, options?: Partial<ToastInput>): string => {
    return useToastStore.getState().addToast({
      type: 'warning',
      title: title || 'Notice',
      message,
      duration: options?.duration ?? 5000,
      ...options,
    })
  },

  info: (message: string, title?: string, options?: Partial<ToastInput>): string => {
    return useToastStore.getState().addToast({
      type: 'info',
      title,
      message,
      ...options,
    })
  },

  loading: (message: string, title?: string, options?: Partial<ToastInput>): string => {
    return useToastStore.getState().addToast({
      type: 'loading',
      title: title || 'Processing…',
      message,
      duration: 0, // Indefinite until dismissed
      ...options,
    })
  },

  dismiss: (id: string): void => {
    useToastStore.getState().dismissToast(id)
  },

  clear: (): void => {
    useToastStore.getState().clearToasts()
  },
}

/**
 * React hook for consuming toasts and dispatchers
 */
export function useToast() {
  const toasts = useToastStore((s) => s.toasts)
  const addToast = useToastStore((s) => s.addToast)
  const dismissToast = useToastStore((s) => s.dismissToast)
  const clearToasts = useToastStore((s) => s.clearToasts)

  return {
    toasts,
    addToast,
    dismissToast,
    clearToasts,
    toast,
  }
}
