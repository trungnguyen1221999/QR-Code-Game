import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex justify-center relative" style={{
      backgroundImage: 'url(/forest2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(240,255,230,0.15)' }} />
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center gap-5">
        <span style={{ fontSize: 80 }}>🌿</span>
        <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)' }}>
          Lost in the forest!
        </h2>
        <p style={{ fontSize: 15, color: 'var(--color-subtext)', lineHeight: 1.7, maxWidth: 280 }}>
          The page you're looking for doesn't exist. The capybara couldn't find it either.
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="btn-press"
          style={{
            marginTop: 8,
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            fontWeight: 700,
            fontSize: 16,
            padding: '14px 36px',
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-btn)',
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
