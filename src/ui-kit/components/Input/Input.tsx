/**
 * Input component
 * Универсальный input с состояниями: default, error, disabled
 */

import React from 'react'
import './Input.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const hasError = !!error
  const classes = [
    'ui-input-wrapper',
    fullWidth && 'ui-input-wrapper--full-width',
    hasError && 'ui-input-wrapper--error',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
        </label>
      )}
      <div className="ui-input-container">
        {leftIcon && <span className="ui-input-icon ui-input-icon--left">{leftIcon}</span>}
        <input
          id={inputId}
          className={`ui-input ${leftIcon ? 'ui-input--with-left-icon' : ''} ${rightIcon ? 'ui-input--with-right-icon' : ''}`}
          {...props}
        />
        {rightIcon && <span className="ui-input-icon ui-input-icon--right">{rightIcon}</span>}
      </div>
      {error && (
        <span className="ui-input-error" role="alert">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="ui-input-helper">
          {helperText}
        </span>
      )}
    </div>
  )
}

