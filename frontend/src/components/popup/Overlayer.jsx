import React, { useEffect } from 'react';

const Overlayer = ({ isOpen, onClose, children, closeOnOverlayClick = true }) => {
  const handleOverlayClick = (e) => {
    // Close if clicking on the overlay (not the content) and closeOnOverlayClick is true
    if (e.target === e.currentTarget && closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when overlay is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling when overlay is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)", // Safari support
      }}
      onClick={handleOverlayClick}
    >
      {children}
    </div>
  );
};

export default Overlayer;