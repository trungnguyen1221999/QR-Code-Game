/**
 * Button variants:
 *  primary  – brown #C07020 (default)
 *  green    – #22C55E
 *  red      – #DC2626
 *  ghost    – transparent, brown text
 */
export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 cursor-pointer';

  const variants = {
    primary: { backgroundColor: '#C07020' },
    green:   { backgroundColor: '#22C55E' },
    red:     { backgroundColor: '#DC2626' },
    ghost:   { backgroundColor: 'transparent', color: '#C07020', border: '1.5px solid #C07020' },
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
