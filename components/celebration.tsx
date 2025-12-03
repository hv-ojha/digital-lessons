'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, Star, Sparkles, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CelebrationType = 'correct' | 'complete' | 'perfect' | 'levelup' | 'badge';

interface CelebrationProps {
  type: CelebrationType;
  message?: string;
  score?: number;
  onComplete?: () => void;
  duration?: number;
  showConfetti?: boolean;
}

const CELEBRATION_CONFIG: Record<CelebrationType, {
  emoji: string;
  color: string;
  gradient: string;
  title: string;
  Icon: typeof Trophy;
}> = {
  correct: {
    emoji: '✓',
    color: 'text-green-500',
    gradient: 'from-green-400 to-teal-500',
    title: 'Correct!',
    Icon: Star,
  },
  complete: {
    emoji: '🎉',
    color: 'text-purple-500',
    gradient: 'from-purple-400 to-pink-500',
    title: 'Lesson Complete!',
    Icon: Trophy,
  },
  perfect: {
    emoji: '⭐',
    color: 'text-yellow-500',
    gradient: 'from-yellow-400 to-orange-500',
    title: 'Perfect Score!',
    Icon: Sparkles,
  },
  levelup: {
    emoji: '🚀',
    color: 'text-blue-500',
    gradient: 'from-blue-400 to-indigo-500',
    title: 'Level Up!',
    Icon: Trophy,
  },
  badge: {
    emoji: '🏆',
    color: 'text-orange-500',
    gradient: 'from-orange-400 to-red-500',
    title: 'Badge Unlocked!',
    Icon: PartyPopper,
  },
};

export function Celebration({
  type,
  message,
  score,
  onComplete,
  duration = 3000,
  showConfetti = true,
}: CelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const config = CELEBRATION_CONFIG[type];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Confetti */}
          {showConfetti && windowSize.width > 0 && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
              colors={['#8B5CF6', '#EC4899', '#F59E0B', '#3B82F6', '#10B981']}
            />
          )}

          {/* Celebration Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none"
          >
            {/* Main Celebration Card */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
              className="pointer-events-auto"
            >
              <div className={cn(
                'relative bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl',
                'max-w-md mx-4'
              )}>
                {/* Animated Icon */}
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="mb-6"
                >
                  <div className={cn(
                    'w-32 h-32 mx-auto rounded-full flex items-center justify-center',
                    'bg-gradient-to-br shadow-2xl',
                    config.gradient
                  )}>
                    <span className="text-7xl">
                      {config.emoji}
                    </span>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-display font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  {config.title}
                </motion.h2>

                {/* Message */}
                {message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-center text-gray-700 dark:text-gray-300 mb-4"
                  >
                    {message}
                  </motion.p>
                )}

                {/* Score */}
                {score !== undefined && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="text-center"
                  >
                    <div className={cn(
                      'inline-block px-8 py-4 rounded-2xl',
                      'bg-gradient-to-r shadow-lg',
                      config.gradient
                    )}>
                      <span className="text-5xl font-bold text-white">
                        {score}%
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Sparkle Effects */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-yellow-400"
                    style={{
                      left: `${20 + (i % 4) * 20}%`,
                      top: `${10 + Math.floor(i / 4) * 40}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Quick Feedback - For correct/incorrect answers
 */
interface QuickFeedbackProps {
  correct: boolean;
  onComplete?: () => void;
}

export function QuickFeedback({ correct, onComplete }: QuickFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={cn(
        'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
        'px-8 py-4 rounded-2xl shadow-2xl',
        correct
          ? 'bg-gradient-to-r from-green-400 to-teal-500'
          : 'bg-gradient-to-r from-red-400 to-pink-500'
      )}
    >
      <div className="flex items-center gap-4">
        <motion.span
          animate={correct ? {
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          } : {
            rotate: [0, -10, 10, -10, 10, 0],
          }}
          transition={{ duration: 0.5 }}
          className="text-5xl"
        >
          {correct ? '✓' : '✗'}
        </motion.span>
        <span className="text-2xl font-bold text-white">
          {correct ? 'Correct!' : 'Try Again!'}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * Points Animation - Flying points indicator
 */
interface PointsAnimationProps {
  points: number;
  x: number;
  y: number;
  onComplete?: () => void;
}

export function PointsAnimation({ points, x, y, onComplete }: PointsAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x, y }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0.8],
        y: y - 100,
      }}
      transition={{ duration: 2 }}
      className="fixed z-50 pointer-events-none"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-2xl">
        <Star className="w-6 h-6 text-white fill-white" />
        <span className="text-2xl font-bold text-white">+{points}</span>
      </div>
    </motion.div>
  );
}
