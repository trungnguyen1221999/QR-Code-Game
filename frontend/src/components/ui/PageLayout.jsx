import BackButton from './BackButton';

export default function PageLayout({ children, back, className = '' }) {
  return (
    <div
      className="min-h-screen flex justify-center relative"
      style={{
        backgroundImage: 'url(/forest2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Frosted overlay to keep content readable */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(240, 255, 230, 0.1)' }}
      />

      <div className={`w-full max-w-sm flex flex-col px-5 pb-12 relative z-10 ${className}`}>
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
