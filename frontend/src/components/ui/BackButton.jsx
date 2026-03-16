import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ to = '/' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => typeof to === 'number' ? navigate(to) : navigate(to)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold btn-press"
      style={{
        backgroundColor: '#FEF0E0',
        color: 'var(--color-primary)',
        border: '1px solid #FFD9A8',
      }}
    >
      <ArrowLeft size={14} />
      Back
    </button>
  );
}
