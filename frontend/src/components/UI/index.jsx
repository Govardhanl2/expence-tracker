import React from 'react';
import './UI.css';

export const Card = ({ children, className = '', onClick }) => (
  <div className={`card ${className} ${onClick ? 'card-clickable' : ''}`} onClick={onClick}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
}) => (
  <button
    type={type}
    className={`btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`}
    disabled={disabled || loading}
    onClick={onClick}
  >
    {loading ? <span className="btn-spinner" /> : icon && <span className="btn-icon">{icon}</span>}
    {children}
  </button>
);

export const Input = ({
  label,
  error,
  className = '',
  prefix,
  ...props
}) => (
  <div className={`input-group ${className}`}>
    {label && <label className="input-label">{label}</label>}
    <div className={`input-wrapper ${prefix ? 'has-prefix' : ''}`}>
      {prefix && <span className="input-prefix">{prefix}</span>}
      <input className={`input-field ${error ? 'input-error' : ''}`} {...props} />
    </div>
    {error && <span className="input-error-msg">{error}</span>}
  </div>
);

export const Select = ({ label, error, className = '', children, ...props }) => (
  <div className={`input-group ${className}`}>
    {label && <label className="input-label">{label}</label>}
    <select className={`input-field select-field ${error ? 'input-error' : ''}`} {...props}>
      {children}
    </select>
    {error && <span className="input-error-msg">{error}</span>}
  </div>
);

export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className={`input-group ${className}`}>
    {label && <label className="input-label">{label}</label>}
    <textarea className={`input-field textarea-field ${error ? 'input-error' : ''}`} {...props} />
    {error && <span className="input-error-msg">{error}</span>}
  </div>
);

export const Skeleton = ({ width, height, className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width: width || '100%', height: height || '16px' }}
  />
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    {Icon && (
      <div className="empty-icon">
        <Icon size={28} />
      </div>
    )}
    <h3 className="empty-title">{title}</h3>
    {description && <p className="empty-desc">{description}</p>}
    {action && <div className="empty-action">{action}</div>}
  </div>
);

export const Spinner = ({ size = 20 }) => (
  <div className="spinner" style={{ width: size, height: size }} />
);

export const CategoryBadge = ({ category }) => {
  const map = {
    Food: 'cat-food',
    Utility: 'cat-utility',
    Subscriptions: 'cat-subscriptions',
    Others: 'cat-others',
  };
  return <span className={`cat-badge ${map[category] || 'cat-others'}`}>{category}</span>;
};
