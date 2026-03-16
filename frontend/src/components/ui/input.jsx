import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Input – consistent text input.
 * Props:
 *   label       – optional label text
 *   icon        – optional lucide icon element shown left of label
 *   error       – error message string
 *   type        – 'text' | 'password' | ... (default 'text')
 *   All native <input> props are forwarded.
 */
export default function Input({ label, icon, error, type = 'text', className = '', ...props }) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          {icon && <span style={{ color: 'var(--color-primary)' }}>{icon}</span>}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword ? (showPw ? 'text' : 'password') : type}
          className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${isPassword ? 'pr-10' : ''} ${className}`}
          style={{
            border: error ? '1.5px solid #EF4444' : '1.5px solid #FFD9A8',
            backgroundColor: '#FFFAF5',
            color: 'var(--color-text)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
          }}
          onFocus={e => {
            e.target.style.border = '1.5px solid var(--color-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(232,115,10,0.15)';
          }}
          onBlur={e => {
            e.target.style.border = error ? '1.5px solid #EF4444' : '1.5px solid #FFD9A8';
            e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.04)';
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-subtext)' }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs font-semibold" style={{ color: '#EF4444' }}>{error}</p>}
    </div>
  );
}
