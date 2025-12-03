'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Educational Background Pattern
 * A playful, kid-friendly background with educational elements
 * Fixed position - stays in place while content scrolls
 * Optimized for performance with reduced animations and prefers-reduced-motion support
 */
export function EducationalBackground() {
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!mediaQuery.matches);

    const handleChange = () => {
      setShouldAnimate(!mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />

      {/* SVG Pattern Overlay */}
      <svg
        className="fixed inset-0 w-full h-full opacity-30 dark:opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Educational icons pattern */}
          <pattern
            id="educational-pattern"
            x="0"
            y="0"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            {/* Book */}
            <g transform="translate(20, 20)" opacity="0.6">
              <rect x="0" y="5" width="30" height="25" rx="2" fill="#8B5CF6" />
              <rect x="14" y="5" width="2" height="25" fill="#fff" opacity="0.3" />
              <rect x="0" y="5" width="30" height="3" rx="1" fill="#6D28D9" />
            </g>

            {/* Star */}
            <g transform="translate(140, 30)" opacity="0.5">
              <path
                d="M15 0 L18 12 L30 12 L20 18 L24 30 L15 22 L6 30 L10 18 L0 12 L12 12 Z"
                fill="#F59E0B"
              />
            </g>

            {/* Pencil */}
            <g transform="translate(80, 100)" opacity="0.6">
              <rect x="10" y="0" width="6" height="35" rx="1" fill="#EC4899" />
              <polygon points="10,0 16,0 13,5" fill="#F9A8D4" />
              <rect x="10" y="30" width="6" height="5" fill="#7C2D12" />
            </g>

            {/* Apple */}
            <g transform="translate(150, 140)" opacity="0.5">
              <circle cx="15" cy="18" r="12" fill="#EF4444" />
              <ellipse cx="15" cy="18" rx="12" ry="13" fill="#DC2626" />
              <path d="M15 6 Q13 8 15 10" stroke="#059669" strokeWidth="2" fill="none" />
              <ellipse cx="12" cy="15" rx="3" ry="4" fill="#FCA5A5" opacity="0.4" />
            </g>

            {/* ABC Letters */}
            <g transform="translate(30, 140)" opacity="0.6">
              <text
                x="0"
                y="20"
                fontFamily="Fredoka, sans-serif"
                fontSize="24"
                fontWeight="bold"
                fill="#3B82F6"
              >
                ABC
              </text>
            </g>

            {/* Numbers 123 */}
            <g transform="translate(100, 60)" opacity="0.6">
              <text
                x="0"
                y="20"
                fontFamily="Fredoka, sans-serif"
                fontSize="24"
                fontWeight="bold"
                fill="#10B981"
              >
                123
              </text>
            </g>
          </pattern>
        </defs>

        {/* Apply pattern */}
        <rect width="100%" height="100%" fill="url(#educational-pattern)" />
      </svg>

      {/* Animated floating shapes - Reduced count for performance */}
      {/* Only render animations after mount to prevent hydration mismatch */}
      {mounted && shouldAnimate && (
        <div className="fixed inset-0">
          {/* Large circles - Reduced from 8 to 4 */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="fixed rounded-full"
              style={{
                width: `${120 + i * 40}px`,
                height: `${120 + i * 40}px`,
                left: `${(i * 25) % 85}%`,
                top: `${(i * 25) % 75}%`,
                background: [
                  'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                ][i % 3],
                willChange: 'transform, opacity',
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, i % 2 === 0 ? 20 : -20, 0],
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Sparkle elements - Reduced from 12 to 6 */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="fixed"
              style={{
                left: `${(i * 15 + 10) % 85}%`,
                top: `${(i * 18 + 5) % 85}%`,
                willChange: 'transform, opacity',
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path
                  d="M10 0 L11 8 L15 5 L12 9 L20 10 L12 11 L15 15 L11 12 L10 20 L9 12 L5 15 L8 11 L0 10 L8 9 L5 5 L9 8 Z"
                  fill={['#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'][i % 4]}
                  opacity="0.4"
                />
              </svg>
            </motion.div>
          ))}
        </div>
      )}

      {/* Static shapes for reduced motion preference */}
      {mounted && !shouldAnimate && (
        <div className="fixed inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="fixed rounded-full opacity-30"
              style={{
                width: `${120 + i * 40}px`,
                height: `${120 + i * 40}px`,
                left: `${(i * 25) % 85}%`,
                top: `${(i * 25) % 75}%`,
                background: [
                  'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                ][i % 3],
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/60 dark:via-gray-900/30 dark:to-gray-900/60" />
    </div>
  );
}

/**
 * Simpler version for other pages
 * Also fixed position for consistent scrolling behavior
 */
export function SimpleEducationalBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      {/* Subtle pattern */}
      <div className="fixed inset-0 opacity-20 dark:opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="simple-dots"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="2" fill="currentColor" className="text-purple-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#simple-dots)" />
        </svg>
      </div>

      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50" />
    </div>
  );
}
