import { X } from 'lucide-react';

/**
 * Popup – modal overlay.
 * Props:
 *   open        – boolean, controls visibility
 *   onClose     – called when backdrop or X is clicked
 *   title       – optional title string
 *   children    – modal content
 *   showClose   – show X button (default true)
 */
export default function Popup({ open, onClose, title, children, showClose = true }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
        {title && (
          <h3 className="text-lg font-bold text-gray-800 mb-4 pr-6">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}
