import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  className?: string
}

interface ModalHeaderProps {
  children: ReactNode
  onClose?: () => void
  className?: string
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
  scrollable?: boolean
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right' | 'between'
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
}

const alignStyles: Record<'left' | 'center' | 'right' | 'between', string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
}

export default function Modal({
  open,
  onClose,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, closeOnEscape, onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === overlayRef.current) onClose()
  }

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-ink-950/50 backdrop-blur-sm',
        'animate-fade-in'
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-2xl border border-ink-100',
          'flex flex-col max-h-[calc(100vh-2rem)]',
          'animate-slide-up',
          sizeStyles[size],
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
  return (
    <div
      className={clsx(
        'flex items-start justify-between gap-4 px-6 py-5 border-b border-ink-100 flex-shrink-0',
        className
      )}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className={clsx(
            'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl',
            'text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors'
          )}
          aria-label="Close modal"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export function ModalBody({ children, className, scrollable = true }: ModalBodyProps) {
  return (
    <div
      className={clsx(
        'px-6 py-5 flex-1',
        scrollable && 'overflow-y-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

export function ModalFooter({
  children,
  className,
  align = 'right',
}: ModalFooterProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-6 py-4 border-t border-ink-100 flex-shrink-0',
        alignStyles[align],
        className
      )}
    >
      {children}
    </div>
  )
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>
        <p className="text-base font-semibold text-ink-900">{title}</p>
        {description && (
          <p className="text-sm text-ink-500 mt-1 leading-relaxed">{description}</p>
        )}
      </ModalHeader>
      <ModalFooter align="right">
        <button
          onClick={onClose}
          disabled={loading}
          className="btn-secondary text-sm px-4 py-2"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={clsx(
            'text-sm px-4 py-2 inline-flex items-center gap-2',
            variant === 'danger' ? 'btn-danger' : 'btn-primary'
          )}
        >
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  )
}