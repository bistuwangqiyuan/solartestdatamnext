import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const Input = forwardRef(({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helper) && (
        <p className={cn(
          'mt-1 text-sm',
          error ? 'text-danger-500' : 'text-gray-500'
        )}>
          {error || helper}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input