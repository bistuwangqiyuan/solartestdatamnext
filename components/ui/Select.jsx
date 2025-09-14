import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({
  label,
  error,
  helper,
  options = [],
  placeholder = '请选择',
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
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            error && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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

Select.displayName = 'Select'

export default Select