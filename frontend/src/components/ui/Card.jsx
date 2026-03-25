/**
 * Card – elevated white card with warm border and shadow.
 * Props:
 *   noPadding – remove default padding for custom layouts
 */
export default function Card({ children, className = '', noPadding = false, ...props }) {
  return (
    <div
      className={`bg-white/80 rounded-2xl font-bold ${noPadding ? '' : 'p-5'} ${className}`}
      style={{
        boxShadow: 'var(--shadow-card)'
      }}
      {...props}
    >
      {children}
    </div>
  );
}
