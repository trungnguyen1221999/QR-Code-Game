/**
 * PageLayout – forest-themed background, phone-width centered column.
 * Usage:
 *   <PageLayout>           – full height, no back button
 *   <PageLayout back="/">  – shows BackButton at top
 */
import BackButton from './BackButton';

export default function PageLayout({ children, back, className = '' }) {
  return (
    <div
      className="min-h-screen flex justify-center"
      style={{
        background: 'linear-gradient(180deg, #EEF7E4 0%, #FFF8F0 50%, #FFF3E0 100%)',
        backgroundImage: `
          linear-gradient(180deg, #EEF7E4 0%, #FFF8F0 50%, #FFF3E0 100%),
          radial-gradient(rgba(76,140,43,0.06) 1.5px, transparent 1.5px)
        `,
        backgroundSize: 'auto, 22px 22px',
        backgroundBlendMode: 'normal',
      }}
    >
      {/* Subtle leaf decorations */}
      <div className="fixed top-0 left-0 w-full pointer-events-none" style={{ zIndex: 0 }}>
        <svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="30" cy="20" rx="28" ry="16" fill="#7CB842" fillOpacity="0.12" transform="rotate(-20 30 20)" />
          <ellipse cx="370" cy="15" rx="22" ry="13" fill="#5A9E2F" fillOpacity="0.10" transform="rotate(15 370 15)" />
          <ellipse cx="200" cy="8" rx="18" ry="10" fill="#8DC94E" fillOpacity="0.08" />
          <ellipse cx="100" cy="-5" rx="35" ry="20" fill="#6DB53B" fillOpacity="0.07" transform="rotate(-10 100 -5)" />
          <ellipse cx="320" cy="5" rx="30" ry="17" fill="#4A9A28" fillOpacity="0.09" transform="rotate(12 320 5)" />
        </svg>
      </div>

      <div className={`w-full max-w-sm flex flex-col px-5 pb-12 relative ${className}`} style={{ zIndex: 1 }}>
        {back !== undefined && (
          <div className="pt-5 pb-2">
            <BackButton to={back} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
