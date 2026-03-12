/**
 * PageLayout – warm background, phone-width centered column.
 * Usage:
 *   <PageLayout>          – full height, no back button
 *   <PageLayout back="/">  – shows BackButton at top
 */
import BackButton from './BackButton';

export default function PageLayout({ children, back, className = '' }) {
  return (
    <div className="min-h-screen flex justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className={`w-full max-w-sm flex flex-col px-5 pb-12 ${className}`}>
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
