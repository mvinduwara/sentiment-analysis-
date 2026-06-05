import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-ink-900 text-white border border-ink-900 hover:bg-ink-800 active:bg-ink-950 shadow-sm',
  secondary:
    'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 active:bg-ink-100',
  danger:
    'bg-crimson-500 text-white border border-crimson-500 hover:bg-crimson-600 active:bg-crimson-700 shadow-sm',
  ghost:
    'bg-transparent text-ink-600 border border-transparent hover:bg-ink-100 hover:text-ink-800',
  outline:
    'bg-transparent text-verdant-700 border border-verdant-400 hover:bg-verdant-50 active:bg-verdant-100',
}

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-[11px] gap-1.5 rounded-lg',
  sm: 'px-3.5 py-2 text-xs gap-2 rounded-xl',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-150 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-verdant-400 focus-visible:ring-offset-2',
        'active:scale-[0.97]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <>
          <span
            className={clsx(
              'rounded-full border-2 animate-spin flex-shrink-0',
              size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
              variant === 'primary' || variant === 'danger'
                ? 'border-white/30 border-t-white'
                : 'border-ink-300 border-t-ink-700'
            )}
          />
          <span>Loading…</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  )
}