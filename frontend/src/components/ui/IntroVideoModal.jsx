
export default function IntroVideoModal({ open, onSkip }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      style={{ width: '100vw', height: '100vh' }}
    >
      <video
        src="/intro.mp4"
        controls={false}
        autoPlay
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          maxWidth: '100vw',
          maxHeight: '100vh',
          // Mobile: full màn hình, Desktop: full height, width auto
          aspectRatio: '9/16',
        }}
        onEnded={onSkip}
        className="intro-video-responsive"
      />
      <button
        onClick={onSkip}
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '10px 22px',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Skip
      </button>
      <style>{`
        @media (min-width: 600px) {
          .intro-video-responsive {
            width: auto !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            aspect-ratio: 9/16;
          }
        }
        @media (max-width: 599px) {
          .intro-video-responsive {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            aspect-ratio: 9/16;
          }
        }
      `}</style>
    </div>
  );
}
