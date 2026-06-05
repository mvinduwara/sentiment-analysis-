import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type BadgeVariant = 'positive' | 'negative' | 'neutral' | 'warning' | 'info' | 'default'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  positive:
    'bg-verdant-50 text-verdant-700 border-verdant-200',
  negative:
    'bg-crimson-50 text-crimson-700 border-crimson-200',
  neutral:
    'bg-ink-50 text-ink-600 border-ink-200',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200',
  info:
    'bg-azure-50 text-azure-700 border-azure-200',
  default:
    'bg-ink-100 text-ink-700 border-ink-200',
}

const dotStyles: Record<BadgeVariant, string> = {
  positive: 'bg-verdant-500',
  negative: 'bg-crimson-500',
  neutral:  'bg-ink-400',
  warning:  'bg-amber-500',
  info:     'bg-azure-500',
  default:  'bg-ink-500',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide leading-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotStyles[variant])}
        />
      )}
      {children}
    </span>
  )
}