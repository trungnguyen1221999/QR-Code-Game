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
    <div className="flex flex-col gap-1">
      {label && (
        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
          {icon && <span style={{ color: '#C07020' }}>{icon}</span>}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword ? (showPw ? 'text' : 'password') : type}
          className={`w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
