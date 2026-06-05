import { clsx } from 'clsx'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  inputSize?: InputSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  inputSize?: InputSize
  fullWidth?: boolean
  charCount?: number
  maxChars?: number
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  inputSize?: InputSize
  fullWidth?: boolean
  children: ReactNode
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-4 py-3 text-base rounded-xl',
}

const baseInput = [
  'bg-white border border-ink-200 text-ink-900 placeholder-ink-300',
  'transition-all duration-150',
  'focus:outline-none focus:border-verdant-400 focus:ring-2 focus:ring-verdant-100',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-ink-50',
].join(' ')

function FieldWrapper({
  label,
  hint,
  error,
  fullWidth,
  children,
}: {
  label?: string
  hint?: string
  error?: string
  fullWidth?: boolean
  children: ReactNode
}) {
  return (
    <div className={clsx('flex flex-col gap-1', fullWidth && 'w-full')}>
      {label && (
        <label className="text-xs font-semibold text-ink-600 uppercase tracking-widest">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-crimson-600">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-ink-400">{hint}</p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      inputSize = 'md',
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <FieldWrapper label={label} hint={hint} error={error} fullWidth={fullWidth}>
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            {...props}
            className={clsx(
              'w-full',
              baseInput,
              sizeStyles[inputSize],
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-crimson-400 focus:border-crimson-400 focus:ring-crimson-100',
              className
            )}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
      </FieldWrapper>
    )
  }
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      inputSize = 'md',
      fullWidth = true,
      charCount,
      maxChars,
      className,
      ...props
    },
    ref
  ) => {
    const remaining = maxChars !== undefined && charCount !== undefined ? maxChars - charCount : null

    return (
      <FieldWrapper label={label} hint={hint} error={error} fullWidth={fullWidth}>
        <div className="relative">
          <textarea
            ref={ref}
            {...props}
            className={clsx(
              'w-full resize-none leading-relaxed',
              baseInput,
              sizeStyles[inputSize],
              error && 'border-crimson-400 focus:border-crimson-400 focus:ring-crimson-100',
              className
            )}
          />
          {remaining !== null && (
            <span
              className={clsx(
                'absolute bottom-3 right-3 text-[10px] font-mono font-medium pointer-events-none',
                remaining < 100 ? 'text-amber-500' : 'text-ink-300'
              )}
            >
              {remaining}
            </span>
          )}
        </div>
      </FieldWrapper>
    )
  }
)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, hint, error, inputSize = 'md', fullWidth = true, className, children, ...props },
    ref
  ) => {
    return (
      <FieldWrapper label={label} hint={hint} error={error} fullWidth={fullWidth}>
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          className={clsx(
            'w-full appearance-none cursor-pointer',
            baseInput,
            sizeStyles[inputSize],
            error && 'border-crimson-400 focus:border-crimson-400 focus:ring-crimson-100',
            className
          )}
        >
          {children}
        </select>
      </FieldWrapper>
    )
  }
)
Select.displayName = 'Select'

export default Input