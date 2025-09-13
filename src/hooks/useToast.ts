import { toast as reactToast } from 'react-toastify'

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration = 5000 }: ToastOptions) => {
    const message = title ? `${title}${description ? ': ' + description : ''}` : description || ''
    
    switch (variant) {
      case 'success':
        reactToast.success(message, { autoClose: duration })
        break
      case 'destructive':
        reactToast.error(message, { autoClose: duration })
        break
      case 'warning':
        reactToast.warning(message, { autoClose: duration })
        break
      default:
        reactToast.info(message, { autoClose: duration })
        break
    }
  }

  return { toast }
}