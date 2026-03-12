import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ to = '/' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => typeof to === 'number' ? navigate(to) : navigate(to)}
      className="flex items-center gap-1 text-sm font-semibold cursor-pointer"
      style={{ color: '#C07020', background: 'none', border: 'none', padding: 0 }}
    >
      <ArrowLeft size={16} /> Back
    </button>
  );
}
