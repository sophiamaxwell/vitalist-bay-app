'use client'

import { forwardRef, InputHTMLAttributes, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface MobileFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const MobileFormInput = forwardRef<HTMLInputElement, MobileFormInputProps>(
  (
    {
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      type = 'text',
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        onFocus?.(e)
      },
      [onFocus]
    )

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        onBlur?.(e)
      },
      [onBlur]
    )

    // Get appropriate input mode and autocomplete based on type
    const getInputAttributes = () => {
      switch (type) {
        case 'email':
          return {
            inputMode: 'email' as const,
            autoComplete: 'email',
            autoCapitalize: 'none',
          }
        case 'tel':
          return {
            inputMode: 'tel' as const,
            autoComplete: 'tel',
          }
        case 'url':
          return {
            inputMode: 'url' as const,
            autoComplete: 'url',
            autoCapitalize: 'none',
          }
        case 'number':
          return {
            inputMode: 'numeric' as const,
          }
        case 'search':
          return {
            inputMode: 'search' as const,
            autoComplete: 'off',
          }
        default:
          return {}
      }
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full min-h-[48px] px-4 py-3 text-base rounded-xl',
              'border-2 transition-colors duration-200',
              'bg-white text-slate-900 placeholder-slate-400',
              // Focus states
              isFocused
                ? 'border-emerald-500 ring-2 ring-emerald-100'
                : error
                ? 'border-red-300'
                : 'border-slate-200',
              // Disabled state
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
              // Icon padding
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...getInputAttributes()}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Hint or Error */}
        {(hint || error) && (
          <p
            className={cn(
              'text-sm',
              error ? 'text-red-500' : 'text-slate-500'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

MobileFormInput.displayName = 'MobileFormInput'

// Mobile-optimized textarea
interface MobileTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ label, hint, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={cn(
            'w-full min-h-[100px] px-4 py-3 text-base rounded-xl',
            'border-2 transition-colors duration-200',
            'bg-white text-slate-900 placeholder-slate-400',
            'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100',
            error ? 'border-red-300' : 'border-slate-200',
            'disabled:bg-slate-50 disabled:text-slate-500',
            'resize-none',
            className
          )}
          {...props}
        />

        {(hint || error) && (
          <p className={cn('text-sm', error ? 'text-red-500' : 'text-slate-500')}>
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

MobileTextarea.displayName = 'MobileTextarea'

// Mobile-optimized select
interface MobileSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(
  ({ label, hint, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full min-h-[48px] px-4 py-3 text-base rounded-xl',
              'border-2 transition-colors duration-200',
              'bg-white text-slate-900 appearance-none',
              'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100',
              error ? 'border-red-300' : 'border-slate-200',
              'disabled:bg-slate-50 disabled:text-slate-500',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {(hint || error) && (
          <p className={cn('text-sm', error ? 'text-red-500' : 'text-slate-500')}>
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

MobileSelect.displayName = 'MobileSelect'
