import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-main dark:text-dark-text">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`input-base ${icon ? 'pl-11' : ''} ${error ? 'border-danger focus:ring-danger/30 focus:border-danger' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-danger animate-slide-in">{error}</p>}
    </div>
  ),
);

Input.displayName = 'Input';
export default Input;
