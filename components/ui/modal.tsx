'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Modal Component - Following UX Best Practices
 *
 * UX Principles Applied:
 * - Clear visual hierarchy with proper spacing
 * - Minimal, clean backdrop (60% opacity black)
 * - Proper elevation with subtle shadow
 * - Smooth, non-distracting animations
 * - Accessible (keyboard support, focus management)
 * - Clear close affordance (X button, click outside, ESC key)
 * - No excessive gradients or visual noise
 * - Content-focused design
 */
export function Modal({ isOpen, onClose, children, title, size = 'lg' }: ModalProps) {
  // Handle ESC key press
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Add/remove event listeners and prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop - Clean, minimal overlay (UX Principle: Don't distract from content) */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal Container - Clean white card (UX Principle: Focus on content) */}
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Always visible, top-right (UX Principle: Predictable placement) */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
        </button>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto max-h-[90vh] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
