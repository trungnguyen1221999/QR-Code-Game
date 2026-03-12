/**
 * Card – white card with rounded corners, shadow, and default padding p-5.
 * Props:
 *   noPadding – remove default padding for custom layouts
 */
export default function Card({ children, className = '', noPadding = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm ${noPadding ? '' : 'p-6'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
