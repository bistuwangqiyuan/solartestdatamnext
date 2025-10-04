import React from 'react'
import { cn } from '@/utils/cn'

const variants = {
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  success: 'bg-success-100 text-success-800',
  danger: 'bg-danger-100 text-danger-800',
  warning: 'bg-warning-100 text-warning-800',
  info: 'bg-info-100 text-info-800',
  gray: 'bg-gray-100 text-gray-800'
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
}

export default function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'inline-block rounded-full',
            size === 'sm' && 'h-1.5 w-1.5',
            size === 'md' && 'h-2 w-2',
            size === 'lg' && 'h-2.5 w-2.5',
            variant === 'primary' && 'bg-primary-600',
            variant === 'secondary' && 'bg-secondary-600',
            variant === 'success' && 'bg-success-600',
            variant === 'danger' && 'bg-danger-600',
            variant === 'warning' && 'bg-warning-600',
            variant === 'info' && 'bg-info-600',
            variant === 'gray' && 'bg-gray-600'
          )}
        />
      )}
      {children}
    </span>
  )
}