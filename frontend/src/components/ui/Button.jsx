/**
 * Button variants:
 *  primary  – orange gradient (default)
 *  green    – green gradient
 *  red      – red gradient
 *  ghost    – transparent, orange border
 */
export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 btn-press disabled:opacity-50 cursor-pointer select-none';

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #F08C20 0%, #C86000 100%)',
      boxShadow: 'var(--shadow-btn)',
    },
    green: {
      background: 'linear-gradient(135deg, #34D374 0%, #16A34A 100%)',
      boxShadow: 'var(--shadow-btn-green)',
    },
    red: {
      background: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
      boxShadow: 'var(--shadow-btn-red)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: '1.5px solid var(--color-primary)',
      boxShadow: 'none',
    },
  };

  return (
    <button
      className={`${base} ${className}`}
      style={variants[variant] ?? variants.primary}
      {...props}
    >
      {children}
    </button>
  );
}
