import React, { useEffect, useState } from 'react';

const Dialog = ({ isOpen, onClose, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
      // Small delay to ensure mount happens before animation
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else if (!isOpen && isMounted) {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      const timeout = setTimeout(() => {
        setIsMounted(false);
      }, 300); // Match this with your transition duration
      return () => clearTimeout(timeout);
    }
  }, [isOpen, isMounted]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`bg-white rounded-lg w-full max-w-md transform transition-all duration-300 ${
            isAnimating
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;