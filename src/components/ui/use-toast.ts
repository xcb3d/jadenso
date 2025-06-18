// Adapted from shadcn/ui toast component
// https://ui.shadcn.com/docs/components/toast

import { useEffect, useState } from "react"

export type ToastProps = {
  id?: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

const TOAST_TIMEOUT = 5000

// Simple in-memory store for toasts
let toasts: ToastProps[] = []
let listeners: Array<(toasts: ToastProps[]) => void> = []

const emitChange = () => {
  listeners.forEach(listener => listener(toasts))
}

export const toast = (props: ToastProps) => {
  const id = Date.now().toString()
  const newToast = { ...props, id }
  
  toasts = [...toasts, newToast]
  emitChange()
  
  // Auto-dismiss
  setTimeout(() => {
    toasts = toasts.filter(t => t !== newToast)
    emitChange()
  }, props.duration || TOAST_TIMEOUT)
  
  return id
}

export const useToast = () => {
  const [localToasts, setLocalToasts] = useState<ToastProps[]>(toasts)
  
  useEffect(() => {
    const handleChange = (newToasts: ToastProps[]) => {
      setLocalToasts([...newToasts])
    }
    
    listeners.push(handleChange)
    return () => {
      listeners = listeners.filter(listener => listener !== handleChange)
    }
  }, [])
  
  return {
    toast,
    toasts: localToasts,
    dismiss: (id: string) => {
      toasts = toasts.filter(t => t.id !== id)
      emitChange()
    }
  }
} 